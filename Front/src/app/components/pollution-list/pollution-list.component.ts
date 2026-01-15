import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PollutionService } from '../../services/pollution.service';
import { Pollution } from '../../models/pollution.model';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FavoritesState, AddFavorite, RemoveFavorite } from '../../store/favorites.state';
import { AuthState } from '../../store/auth.state';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pollution-list',
  templateUrl: './pollution-list.component.html',
  styleUrls: ['./pollution-list.component.css']
})
export class PollutionListComponent implements OnInit {
  pollutions: Pollution[] = [];
  filteredPollutions: Pollution[] = [];
  loading: boolean = false;
  error: string = '';
  showFavoritesOnly: boolean = false;

  // Filtres
  searchTerm: string = '';
  selectedType: string = '';
  selectedStatut: string = '';

  // Liste des types et statuts pour les filtres
  types = ['plastique', 'chimique', 'sonore', 'visuelle', 'eau', 'air', 'sol', 'dechet', 'autre'];
  statuts = ['signalee', 'en_cours', 'resolue'];

  apiUrl = environment.apiUrl.replace('/api', '');

  @Select(FavoritesState.getFavorites) favorites$!: Observable<Pollution[]>;
  @Select(AuthState.isAuthenticated) isAuthenticated$!: Observable<boolean>;
  @Select(AuthState.getUserId) currentUserId$!: Observable<number | null>;

  constructor(
    private pollutionService: PollutionService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      this.showFavoritesOnly = url[0]?.path === 'favorites';
      this.loadPollutions();
    });
  }

  loadPollutions(): void {
    if (this.showFavoritesOnly) {
      this.favorites$.subscribe(favorites => {
        this.pollutions = favorites;
        this.applyFilters();
      });
    } else {
      this.loading = true;
      this.error = '';

      this.pollutionService.getAllPollutions().subscribe({
        next: (data) => {
          this.pollutions = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des pollutions:', error);
          this.error = 'Erreur lors du chargement des pollutions';
          this.loading = false;
        }
      });
    }
  }

  applyFilters(): void {
    this.filteredPollutions = this.pollutions.filter(pollution => {
      // Filtre par recherche textuelle
      const matchesSearch = !this.searchTerm ||
        pollution.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        pollution.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        pollution.localisation.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtre par type
      const matchesType = !this.selectedType || pollution.type === this.selectedType;

      // Filtre par statut
      const matchesStatut = !this.selectedStatut || pollution.statut === this.selectedStatut;

      return matchesSearch && matchesType && matchesStatut;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatut = '';
    this.applyFilters();
  }

  viewDetails(id: number | undefined): void {
    if (!id) return;
    this.router.navigate(['/pollutions', id]);
  }

  deletePollution(id: number | undefined, event: Event): void {
    event.stopPropagation();
    if (!id) return;

    if (confirm('Etes-vous sur de vouloir supprimer cette pollution ?')) {
      this.pollutionService.deletePollution(id).subscribe({
        next: () => {
          this.pollutions = this.pollutions.filter(p => p.id !== id);
          this.applyFilters();
        },
        error: (error) => {
          alert(error.error?.error || 'Erreur lors de la suppression');
        }
      });
    }
  }

  editPollution(id: number | undefined, event: Event): void {
    event.stopPropagation();
    if (!id) return;
    this.router.navigate(['/pollutions/edit', id]);
  }

  canEdit(pollution: Pollution): boolean {
    const userId = this.store.selectSnapshot(AuthState.getUserId);
    return userId === pollution.userId;
  }

  getStatusClass(statut: string | undefined): string {
    switch(statut) {
      case 'signalee': return 'status-signaled';
      case 'en_cours': return 'status-progress';
      case 'resolue': return 'status-resolved';
      default: return '';
    }
  }

  getStatutLabel(statut: string | undefined): string {
    const labels: { [key: string]: string } = {
      'signalee': 'Signalee',
      'en_cours': 'En cours',
      'resolue': 'Resolue'
    };
    return labels[statut || ''] || statut || '';
  }

  getTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'plastique': 'Plastique',
      'chimique': 'Chimique',
      'sonore': 'Sonore',
      'visuelle': 'Visuelle',
      'eau': 'Eau',
      'air': 'Air',
      'sol': 'Sol',
      'dechet': 'Dechet',
      'autre': 'Autre'
    };
    return types[type] || type;
  }

  isFavorite(pollutionId: number | undefined): boolean {
    if (!pollutionId) return false;
    return this.store.selectSnapshot(FavoritesState.isFavorite)(pollutionId);
  }

  toggleFavorite(pollution: Pollution, event: Event): void {
    event.stopPropagation();
    if (!pollution.id) return;

    if (this.isFavorite(pollution.id)) {
      this.store.dispatch(new RemoveFavorite(pollution.id));
    } else {
      this.store.dispatch(new AddFavorite(pollution));
    }
  }
}

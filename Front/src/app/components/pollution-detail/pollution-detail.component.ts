import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { PollutionService } from '../../services/pollution.service';
import { Pollution } from '../../models/pollution.model';
import { FavoritesState, AddFavorite, RemoveFavorite } from '../../store/favorites.state';
import { AuthState } from '../../store/auth.state';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pollution-detail',
  templateUrl: './pollution-detail.component.html',
  styleUrls: ['./pollution-detail.component.css']
})
export class PollutionDetailComponent implements OnInit {
  pollution: Pollution | null = null;
  loading = true;
  error = '';
  apiUrl = environment.apiUrl.replace('/api', '');

  @Select(AuthState.isAuthenticated) isAuthenticated$!: Observable<boolean>;
  @Select(AuthState.getUserId) currentUserId$!: Observable<number | null>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pollutionService: PollutionService,
    private store: Store
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPollution(+id);
    }
  }

  loadPollution(id: number): void {
    this.loading = true;
    this.pollutionService.getPollutionById(id).subscribe({
      next: (pollution) => {
        this.pollution = pollution;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Pollution non trouvee';
        this.loading = false;
      }
    });
  }

  isFavorite(pollutionId: number): boolean {
    return this.store.selectSnapshot(FavoritesState.isFavorite)(pollutionId);
  }

  toggleFavorite(): void {
    if (!this.pollution) return;

    if (this.isFavorite(this.pollution.id!)) {
      this.store.dispatch(new RemoveFavorite(this.pollution.id!));
    } else {
      this.store.dispatch(new AddFavorite(this.pollution));
    }
  }

  canEdit(): boolean {
    if (!this.pollution) return false;
    const userId = this.store.selectSnapshot(AuthState.getUserId);
    return userId === this.pollution.userId;
  }

  editPollution(): void {
    if (this.pollution) {
      this.router.navigate(['/pollutions/edit', this.pollution.id]);
    }
  }

  deletePollution(): void {
    if (!this.pollution) return;

    if (confirm('Etes-vous sur de vouloir supprimer cette pollution ?')) {
      this.pollutionService.deletePollution(this.pollution.id!).subscribe({
        next: () => {
          this.router.navigate(['/pollutions']);
        },
        error: (err) => {
          this.error = err.error?.error || 'Erreur lors de la suppression';
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/pollutions']);
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'signalee': return 'statut-signalee';
      case 'en_cours': return 'statut-en-cours';
      case 'resolue': return 'statut-resolue';
      default: return '';
    }
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

  getStatutLabel(statut: string): string {
    const statuts: { [key: string]: string } = {
      'signalee': 'Signalee',
      'en_cours': 'En cours',
      'resolue': 'Resolue'
    };
    return statuts[statut] || statut;
  }
}

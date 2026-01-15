import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { PollutionService } from '../../services/pollution.service';
import { Pollution } from '../../models/pollution.model';
import { AuthState } from '../../store/auth.state';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pollution-form',
  templateUrl: './pollution-form.component.html',
  styleUrls: ['./pollution-form.component.css']
})
export class PollutionFormComponent implements OnInit {
  pollutionForm!: FormGroup;
  isEditMode: boolean = false;
  pollutionId?: number;
  loading: boolean = false;
  submitError: string = '';
  selectedFile: File | null = null;
  currentPhotoUrl: string | null = null;
  apiUrl = environment.apiUrl.replace('/api', '');

  typesPolluton = ['plastique', 'chimique', 'sonore', 'visuelle', 'eau', 'air', 'sol', 'dechet', 'autre'];
  statuts = ['signalee', 'en_cours', 'resolue'];

  constructor(
    private formBuilder: FormBuilder,
    private pollutionService: PollutionService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) { }

  ngOnInit(): void {
    // Vérifier que l'utilisateur est connecté
    const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    this.initForm();

    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.pollutionId = +params['id'];
        this.loadPollution(this.pollutionId);
      }
    });
  }

  initForm(): void {
    this.pollutionForm = this.formBuilder.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['', Validators.required],
      localisation: ['', Validators.required],
      latitude: [''],
      longitude: [''],
      statut: ['signalee']
    });
  }

  loadPollution(id: number): void {
    this.pollutionService.getPollutionById(id).subscribe({
      next: (pollution) => {
        // Vérifier que l'utilisateur est le propriétaire
        const userId = this.store.selectSnapshot(AuthState.getUserId);
        if (pollution.userId !== userId) {
          alert('Vous n\'etes pas autorise a modifier cette pollution');
          this.router.navigate(['/pollutions']);
          return;
        }

        this.pollutionForm.patchValue({
          titre: pollution.titre,
          description: pollution.description,
          type: pollution.type,
          localisation: pollution.localisation,
          latitude: pollution.latitude || '',
          longitude: pollution.longitude || '',
          statut: pollution.statut || 'signalee'
        });

        if (pollution.photo) {
          this.currentPhotoUrl = `${this.apiUrl}/uploads/${pollution.photo}`;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la pollution:', error);
        alert('Pollution non trouvee');
        this.router.navigate(['/pollutions']);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.submitError = 'Seules les images sont autorisees (jpeg, png, gif, webp)';
        return;
      }

      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.submitError = 'L\'image ne doit pas depasser 5MB';
        return;
      }

      this.selectedFile = file;
      this.submitError = '';

      // Prévisualisation
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentPhotoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.selectedFile = null;
    this.currentPhotoUrl = null;
  }

  onSubmit(): void {
    if (this.pollutionForm.invalid) {
      Object.keys(this.pollutionForm.controls).forEach(key => {
        this.pollutionForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.submitError = '';

    // Créer FormData pour l'upload
    const formData = new FormData();
    formData.append('titre', this.pollutionForm.value.titre);
    formData.append('description', this.pollutionForm.value.description);
    formData.append('type', this.pollutionForm.value.type);
    formData.append('localisation', this.pollutionForm.value.localisation);

    if (this.pollutionForm.value.latitude) {
      formData.append('latitude', this.pollutionForm.value.latitude);
    }
    if (this.pollutionForm.value.longitude) {
      formData.append('longitude', this.pollutionForm.value.longitude);
    }
    if (this.pollutionForm.value.statut) {
      formData.append('statut', this.pollutionForm.value.statut);
    }

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    if (this.isEditMode && this.pollutionId) {
      // Mise à jour
      this.pollutionService.updatePollutionWithFile(this.pollutionId, formData).subscribe({
        next: () => {
          this.router.navigate(['/pollutions']);
        },
        error: (error) => {
          console.error('Erreur lors de la mise a jour:', error);
          this.submitError = error.error?.error || 'Erreur lors de la mise a jour de la pollution';
          this.loading = false;
        }
      });
    } else {
      // Création
      this.pollutionService.createPollutionWithFile(formData).subscribe({
        next: () => {
          this.router.navigate(['/pollutions']);
        },
        error: (error) => {
          console.error('Erreur lors de la creation:', error);
          this.submitError = error.error?.error || 'Erreur lors de la creation de la pollution';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/pollutions']);
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.pollutionForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
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

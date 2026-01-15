import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  loading: boolean = false;
  submitError: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initialiser le formulaire
   */
  initForm(): void {
    this.userForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.submitError = '';

    const userData: User = this.userForm.value;

    this.userService.createUser(userData).subscribe({
      next: (response) => {
        console.log('Utilisateur créé avec succès:', response);
        alert('Utilisateur créé avec succès ! Vous pouvez maintenant signaler des pollutions.');
        this.router.navigate(['/pollutions/new']);
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        this.submitError = error.error?.message || 'Erreur lors de la création de l\'utilisateur';
        this.loading = false;
      }
    });
  }

  /**
   * Annuler et retourner à la liste des utilisateurs
   */
  cancel(): void {
    this.router.navigate(['/users']);
  }

  /**
   * Vérifier si un champ a une erreur
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }
}

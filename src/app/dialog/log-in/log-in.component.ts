import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputfieldComponent } from 'app/inputfield/inputfield.component';
import { GlobalVariablesService } from 'app/services/global-variables.service';
import { DialogComponent } from "../dialog.component";
import { ButtonComponent } from 'app/button/button.component';
import { AuthService } from 'app/firebase-services/auth.service';
import { FirebaseUserService } from 'app/firebase-services/firebase-user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  standalone: true,
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
  imports: [CommonModule, InputfieldComponent, ButtonComponent, FormsModule, DialogComponent]
})
export class LogInComponent {
  globalVariables = inject(GlobalVariablesService);
  private userService = inject(FirebaseUserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  logInUserData = {
    email: "",
    password: ""
  }

  async onSubmit() {
    const { email, password } = this.logInUserData;
    try {
      const userCredential = await this.authService.login(email, password);
      const uid = userCredential.user.uid;
      await this.userService.updateUserStatus(uid, true);
      this.userService.updateCurrentUser(userCredential);
      this.router.navigate(['/dashboard']);
    } catch (error) {
    }
  }

  async loginWithGoogle() {
    try {
      const userCredential = await this.authService.loginWithGoogle();
      if (userCredential) {
        console.log("Erfolgreich mit Google angemeldet", userCredential);
        await this.userService.addUser(userCredential.uid, {
          name: userCredential.displayName,
          email: userCredential.email,
          isActive: true,
          img: userCredential.photoURL
        });
        this.userService.updateCurrentUser(userCredential);
        this.router.navigate(['/dashboard']);
      } else {
        console.error("Google-Anmeldung fehlgeschlagen.");
      }
    } catch (error) {
      console.error("Fehler bei der Verarbeitung der Google-Anmeldung", error);
    }
  }

  redirectDashboard() {
    window.location.href = '/dashboard';
  }
}

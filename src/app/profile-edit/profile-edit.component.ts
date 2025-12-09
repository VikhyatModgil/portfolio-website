import { Component, inject, signal, ChangeDetectionStrategy, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { UserService, UserProfile, ContactInfo, Experience, Education } from '../services/user.service';

@Component({
  selector: 'app-profile-edit',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  protected userService = inject(UserService);

  profileForm!: FormGroup;
  saving = signal(false);
  newSkill = signal('');

  constructor() {
    effect(() => {
      if (!this.userService.loading() && !this.profileForm) {
        this.initializeForm();
      }
    });
  }

  private initializeForm(): void {
    const profile = this.userService.userProfile();

    this.profileForm = this.fb.group({
      name: [profile.name, [Validators.required, Validators.minLength(2)]],
      title: [profile.title, [Validators.required, Validators.minLength(5)]],
      bio: [profile.bio, [Validators.required, Validators.minLength(20)]],
      resumeLink: [profile.resumeLink || ''],
      cvLink: [profile.cvLink || ''],
      profilePictureUrl: [profile.profilePictureUrl || ''],
      projectsLink: [profile.projectsLink || ''],
      skills: this.fb.array(profile.skills.map(skill => this.fb.control(skill, Validators.required))),
      contactInfo: this.fb.array(
        profile.contactInfo.map(contact =>
          this.fb.group({
            type: [contact.type, Validators.required],
            value: [contact.value, Validators.required],
            icon: [contact.icon, Validators.required]
          })
        )
      ),
      experience: this.fb.array(
        profile.experience.map(exp =>
          this.fb.group({
            title: [exp.title, Validators.required],
            company: [exp.company, Validators.required],
            location: [exp.location, Validators.required],
            dates: [exp.dates, Validators.required],
            description: this.fb.array(
              exp.description.map(desc => this.fb.control(desc, Validators.required))
            )
          })
        )
      ),
      education: this.fb.array(
        (profile.education || []).map(edu =>
          this.fb.group({
            degree: [edu.degree, Validators.required],
            institution: [edu.institution, Validators.required],
            location: [edu.location, Validators.required],
            dates: [edu.dates, Validators.required],
            coursework: this.fb.array(
              (edu.coursework || []).map(course => this.fb.control(course))
            )
          })
        )
      )
    });
  }

  get skills(): FormArray {
    return this.profileForm.get('skills') as FormArray;
  }

  get contactInfo(): FormArray {
    return this.profileForm.get('contactInfo') as FormArray;
  }

  get experience(): FormArray {
    return this.profileForm.get('experience') as FormArray;
  }

  get education(): FormArray {
    return this.profileForm.get('education') as FormArray;
  }

  getExperienceDescription(expIndex: number): FormArray {
    return this.experience.at(expIndex).get('description') as FormArray;
  }

  getEducationCoursework(eduIndex: number): FormArray {
    return this.education.at(eduIndex).get('coursework') as FormArray;
  }

  addSkill(): void {
    const skill = this.newSkill().trim();
    if (skill) {
      this.skills.push(this.fb.control(skill, Validators.required));
      this.newSkill.set('');
    }
  }

  removeSkill(index: number): void {
    this.skills.removeAt(index);
  }

  addContactInfo(): void {
    this.contactInfo.push(
      this.fb.group({
        type: ['', Validators.required],
        value: ['', Validators.required],
        icon: ['contact_mail', Validators.required]
      })
    );
  }

  removeContactInfo(index: number): void {
    this.contactInfo.removeAt(index);
  }

  addExperience(): void {
    this.experience.push(
      this.fb.group({
        title: ['', Validators.required],
        company: ['', Validators.required],
        location: ['', Validators.required],
        dates: ['', Validators.required],
        description: this.fb.array([this.fb.control('', Validators.required)])
      })
    );
  }

  removeExperience(index: number): void {
    this.experience.removeAt(index);
  }

  addExperienceDescription(expIndex: number): void {
    this.getExperienceDescription(expIndex).push(this.fb.control('', Validators.required));
  }

  removeExperienceDescription(expIndex: number, descIndex: number): void {
    this.getExperienceDescription(expIndex).removeAt(descIndex);
  }

  addEducation(): void {
    this.education.push(
      this.fb.group({
        degree: ['', Validators.required],
        institution: ['', Validators.required],
        location: ['', Validators.required],
        dates: ['', Validators.required],
        coursework: this.fb.array([])
      })
    );
  }

  removeEducation(index: number): void {
    this.education.removeAt(index);
  }

  addEducationCoursework(eduIndex: number): void {
    this.getEducationCoursework(eduIndex).push(this.fb.control(''));
  }

  removeEducationCoursework(eduIndex: number, courseIndex: number): void {
    this.getEducationCoursework(eduIndex).removeAt(courseIndex);
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000
      });
      return;
    }

    this.saving.set(true);

    try {
      const formValue = this.profileForm.value;
      const updatedProfile: UserProfile = {
        name: formValue.name,
        title: formValue.title,
        bio: formValue.bio,
        resumeLink: formValue.resumeLink,
        cvLink: formValue.cvLink,
        profilePictureUrl: formValue.profilePictureUrl,
        projectsLink: formValue.projectsLink,
        skills: formValue.skills,
        contactInfo: formValue.contactInfo,
        experience: formValue.experience,
        education: formValue.education
      };

      await this.userService.updateUserProfile(updatedProfile);

      this.snackBar.open('Profile updated successfully!', 'Close', {
        duration: 3000
      });

      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error saving profile:', error);
      this.snackBar.open('Failed to update profile. Please try again.', 'Close', {
        duration: 3000
      });
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/']);
  }

  async clearAll(): Promise<void> {
    if (!confirm('Are you sure you want to clear all fields? This will remove all your profile data.')) {
      return;
    }

    this.saving.set(true);

    try {
      const emptyProfile: UserProfile = {
        name: '',
        title: '',
        bio: '',
        skills: [],
        contactInfo: [],
        experience: [],
        education: [],
        resumeLink: '',
        cvLink: '',
        profilePictureUrl: '',
        projectsLink: ''
      };

      await this.userService.updateUserProfile(emptyProfile);

      this.snackBar.open('All fields cleared!', 'Close', {
        duration: 3000
      });

      this.initializeForm();
    } catch (error) {
      console.error('Error clearing profile:', error);
      this.snackBar.open('Failed to clear profile. Please try again.', 'Close', {
        duration: 3000
      });
    } finally {
      this.saving.set(false);
    }
  }

  async resetToDefault(): Promise<void> {
    if (!confirm('Are you sure you want to reset all fields to their default values? This will overwrite all your current changes.')) {
      return;
    }

    this.saving.set(true);

    try {
      await this.userService.resetToDefault();

      this.snackBar.open('Profile reset to default values!', 'Close', {
        duration: 3000
      });

      this.initializeForm();
    } catch (error) {
      console.error('Error resetting profile:', error);
      this.snackBar.open('Failed to reset profile. Please try again.', 'Close', {
        duration: 3000
      });
    } finally {
      this.saving.set(false);
    }
  }
}

import { Routes } from '@angular/router';
import { ProfileViewComponent } from './profile-view/profile-view.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';

export const routes: Routes = [
  {
    path: '',
    component: ProfileViewComponent
  },
  {
    path: 'edit',
    component: ProfileEditComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ProfileInfoComponent } from './profile-info/profile-info.component';
import { MenuBar } from './menu-bar/menu-bar';
import { Portfolio } from './portfolio/portfolio';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss'],
  imports: [ProfileInfoComponent, MenuBar, Portfolio],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileViewComponent {
  selectedSection = signal<string>('');

  onMenuItemSelected(menuItem: string) {
    const sectionMap: { [key: string]: string } = {
      'About': 'about',
      'Education': 'education',
      'Resume': 'resume',
      'CV': 'cv',
      'Experience': 'experience',
      'Skills': 'skills'
    };

    const sectionId = sectionMap[menuItem];
    if (sectionId) {
      this.selectedSection.set(sectionId);
    }
  }
}

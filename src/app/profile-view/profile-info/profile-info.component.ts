import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { NgOptimizedImage } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss'],
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatTooltipModule, MatSnackBarModule, ClipboardModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileInfoComponent {
  protected readonly userService = inject(UserService);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  handleContactClick(type: string, value: string): void {
    if (type === 'linkedin' || type === 'gitlab' || type === 'website') {
      this.openLink(value);
    } else {
      this.copyToClipboard(value, this.getContactLabel(type));
    }
  }

  private copyToClipboard(value: string, label: string): void {
    const success = this.clipboard.copy(value);
    if (success) {
      this.snackBar.open(`${label} copied to clipboard!`, 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  private openLink(value: string): void {
    const url = value.startsWith('http') ? value : `https://${value}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private getContactLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'phone': 'Phone number',
      'email': 'Email',
      'linkedin': 'LinkedIn',
      'gitlab': 'GitLab',
      'github': 'GitHub',
      'website': 'Website'
    };
    return labels[type] || 'Contact info';
  }
}

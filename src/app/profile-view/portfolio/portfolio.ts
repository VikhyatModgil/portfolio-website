import { Component, ViewChild, ElementRef, inject, input, effect, computed } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

interface MenuItem {
  label: string;
  icon: string;
}

interface ResumeData {
  contact: {
    phone: string;
    email: string;
    linkedin: string;
    gitlab: string;
  };
  summary: string;
  education: {
    university: string;
    location: string;
    degree: string;
    dates: string;
  }[];
  experience: {
    title: string;
    company: string;
    location: string;
    dates: string;
    description: string[];
  }[];
  skills: {
    languages: string[];
    frameworksLibraries: string[];
    developerTools: string[];
    concepts: string[];
  };
}

@Component({
  selector: 'app-portfolio',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,
    ClipboardModule
  ],
  templateUrl: './portfolio.html',
  styleUrls: ['./portfolio.scss']
})
export class Portfolio {
  private matIconRegistry = inject(MatIconRegistry);
  private domSanitizer = inject(DomSanitizer);
  private clipboard = inject(Clipboard);
  private snackBar = inject(MatSnackBar);
  protected userService = inject(UserService);

  scrollToSection = input<string>();

  menuItems: MenuItem[] = [
    { label: 'Experience', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
    { label: 'About', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
    { label: 'Resume', icon: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' },
    { label: 'Projects', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' },
    { label: 'Education', icon: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z' },
    { label: 'Certifications', icon: 'M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z' },
    { label: 'Skills', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' }
  ];

  resumeData = computed(() => {
    const profile = this.userService.userProfile();
    const phoneContact = profile.contactInfo.find(c => c.type === 'phone');
    const emailContact = profile.contactInfo.find(c => c.type === 'email');
    const linkedinContact = profile.contactInfo.find(c => c.type === 'linkedin');
    const gitlabContact = profile.contactInfo.find(c => c.type === 'gitlab');

    return {
      contact: {
        phone: phoneContact?.value || '',
        email: emailContact?.value || '',
        linkedin: linkedinContact ? `https://${linkedinContact.value}` : '',
        gitlab: gitlabContact ? `https://${gitlabContact.value}` : ''
      },
      summary: profile.bio,
      education: [] as { university: string; location: string; degree: string; dates: string; }[],
      experience: profile.experience,
      skills: {
        languages: [] as string[],
        frameworksLibraries: [] as string[],
        developerTools: [] as string[],
        concepts: [] as string[]
      }
    };
  });

  activeSection: string = 'experience';

  @ViewChild('portfolioContent') portfolioContent!: ElementRef;

  constructor() {
    this.registerSvgIcons();

    effect(() => {
      const sectionId = this.scrollToSection();
      if (sectionId) {
        this.performScrollToSection(sectionId.toLowerCase());
      }
    });

    if (typeof window !== 'undefined' && window.location.hash) {
      this.activeSection = window.location.hash.substring(1);
    }
  }

  private registerSvgIcons(): void {
    this.menuItems.forEach(item => {
      this.matIconRegistry.addSvgIconLiteral(
        item.label.toLowerCase(),
        this.domSanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24"><path d="${item.icon}"/></svg>`)
      );
    });

    this.matIconRegistry.addSvgIconLiteral(
      'phone',
      this.domSanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>')
    );
    this.matIconRegistry.addSvgIconLiteral(
      'email',
      this.domSanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>')
    );
    this.matIconRegistry.addSvgIconLiteral(
      'download',
      this.domSanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>')
    );
    this.matIconRegistry.addSvgIconLiteral(
      'linkedin',
      this.domSanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>')
    );
    this.matIconRegistry.addSvgIconLiteral(
      'gitlab',
      this.domSanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.919 1.263a.455.455 0 0 0-.867 0L1.388 9.452.045 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.624-8.443a.92.92 0 0 0 .331-1.024"/></svg>')
    );
  }

  performScrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeSection = sectionId;
    }
  }

  copyToClipboard(value: string, label: string): void {
    const success = this.clipboard.copy(value);
    if (success) {
      this.snackBar.open(`${label} copied to clipboard!`, 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  openLink(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  openResumeLink(): void {
    const resumeLink = this.userService.userProfile().resumeLink;
    const userName = this.userService.userProfile().name;

    if (resumeLink) {
      const link = document.createElement('a');
      link.href = resumeLink;
      link.target = '_blank';

      const fileName = userName ? `${userName.replace(/\s+/g, '_')}_Resume.pdf` : 'Resume.pdf';
      link.download = fileName;
      link.rel = 'noopener noreferrer';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  openCvLink(): void {
    const cvLink = this.userService.userProfile().cvLink;
    const userName = this.userService.userProfile().name;

    if (cvLink) {
      const link = document.createElement('a');
      link.href = cvLink;
      link.target = '_blank';

      const fileName = userName ? `${userName.replace(/\s+/g, '_')}_CV.pdf` : 'CV.pdf';
      link.download = fileName;
      link.rel = 'noopener noreferrer';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  openProjectsLink(): void {
    const projectsLink = this.userService.userProfile().projectsLink;
    if (projectsLink) {
      window.open(projectsLink, '_blank', 'noopener,noreferrer');
    }
  }
}

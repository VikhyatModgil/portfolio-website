import {Component, ElementRef, ViewChild, output, inject, computed} from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-menu-bar',
  imports: [],
  templateUrl: './menu-bar.html',
  styleUrl: './menu-bar.scss',
  host: {
    '(window:resize)': 'onResize()'
  }
})
export class MenuBar {
  @ViewChild('menuWrapper') menuWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('menuBar') menuBar!: ElementRef<HTMLElement>;

  private userService = inject(UserService);

  selectedIndex = 0;
  canScrollLeft = false;
  canScrollRight = false;

  menuItemSelected = output<string>();

  private allMenuItems = [
    {
      label: 'Education',
      icon: 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z'
    },
    {
      label: 'Resume',
      icon: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'
    },
    {
      label: 'CV',
      icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'
    },
    {
      label: 'Skills',
      icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'
    },
    {
      label: 'Experience',
      icon: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z'
    }
  ];

  menuItems = computed(() => {
    const profile = this.userService.userProfile();
    return this.allMenuItems.filter(item => {
      switch (item.label) {
        case 'Resume':
          return !!profile.resumeLink;
        case 'CV':
          return !!profile.cvLink;
        case 'Skills':
          return profile.skills && profile.skills.length > 0;
        case 'Experience':
          return profile.experience && profile.experience.length > 0;
        case 'Education':
          return profile.education && profile.education.length > 0;
        default:
          return true;
      }
    });
  });

  ngAfterViewInit() {
    this.checkScrollButtons();

    window.addEventListener('resize', () => this.checkScrollButtons());

    if (this.menuWrapper) {
      this.menuWrapper.nativeElement.addEventListener('scroll', () => this.checkScrollButtons());
    }
  }

  onResize() {
    this.checkScrollButtons();
  }

  checkScrollButtons() {
    if (!this.menuWrapper) return;

    const wrapper = this.menuWrapper.nativeElement;
    const scrollLeft = wrapper.scrollLeft;
    const scrollWidth = wrapper.scrollWidth;
    const clientWidth = wrapper.clientWidth;

    this.canScrollLeft = scrollLeft > 0;
    this.canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;
  }

  scrollLeft() {
    if (!this.menuWrapper) return;

    const wrapper = this.menuWrapper.nativeElement;
    const scrollAmount = wrapper.clientWidth * 0.8;
    wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }

  scrollRight() {
    if (!this.menuWrapper) return;

    const wrapper = this.menuWrapper.nativeElement;
    const scrollAmount = wrapper.clientWidth * 0.8;
    wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  selectItem(index: number) {
    this.selectedIndex = index;
    const selectedMenuItem = this.menuItems()[index];

    this.menuItemSelected.emit(selectedMenuItem.label);

    if (this.menuBar) {
      const items = this.menuBar.nativeElement.querySelectorAll('.menu-item');
      const selectedItem = items[index] as HTMLElement;

      if (selectedItem && this.menuWrapper) {
        const wrapper = this.menuWrapper.nativeElement;
        const itemLeft = selectedItem.offsetLeft;
        const itemRight = itemLeft + selectedItem.offsetWidth;
        const wrapperScroll = wrapper.scrollLeft;
        const wrapperWidth = wrapper.clientWidth;

        if (itemLeft < wrapperScroll) {
          wrapper.scrollTo({ left: itemLeft - 20, behavior: 'smooth' });
        } else if (itemRight > wrapperScroll + wrapperWidth) {
          wrapper.scrollTo({ left: itemRight - wrapperWidth + 20, behavior: 'smooth' });
        }
      }
    }
  }
}

import { Injectable, signal, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, onSnapshot } from '@angular/fire/firestore';

export interface ContactInfo {
  type: string;
  value: string;
  icon: string;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  dates: string;
  description: string[];
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  dates: string;
  coursework?: string[];
}

export interface UserProfile {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  contactInfo: ContactInfo[];
  experience: Experience[];
  education: Education[];
  resumeLink?: string;
  cvLink?: string;
  profilePictureUrl?: string;
  projectsLink?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private readonly USER_PROFILE_ID = 'default-user';

  private readonly DEFAULT_PROFILE: UserProfile = {
  name: 'First Last',
  title: 'Job Title',
  bio: 'Short professional bio goes here. Describe experience level, domain focus, and key strengths in 2–4 sentences.',
  resumeLink: '/resume.pdf',
  cvLink: '/csv.pdf',
  profilePictureUrl: '/pfp.jpg',
  projectsLink: 'https://github.com/username-placeholder',
  skills: [
    'Skill A',
    'Skill B',
    'Skill C',
    'Technology X',
    'Framework Y',
    'Tool Z'
  ],
  contactInfo: [
    {
      type: 'phone',
      value: '(000)000-0000',
      icon: 'phone'
    },
    {
      type: 'email',
      value: 'example@example.com',
      icon: 'email'
    },
    {
      type: 'linkedin',
      value: 'linkedin.com/in/placeholder',
      icon: 'work'
    },
    {
      type: 'github',
      value: 'github.com/username-placeholder',
      icon: 'code'
    }
  ],
  experience: [
    {
      title: 'Job Title Placeholder',
      company: 'Company Name Placeholder',
      location: 'City, State',
      dates: 'Start Date – End Date',
      description: [
        'Description line 1 placeholder.',
        'Description line 2 placeholder.',
        'Description line 3 placeholder.'
      ]
    },
    {
      title: 'Job Title Placeholder',
      company: 'Company Name Placeholder',
      location: 'City, State',
      dates: 'Start Date – End Date',
      description: [
        'Description line 1 placeholder.',
        'Description line 2 placeholder.',
        'Description line 3 placeholder.'
      ]
    }
  ],
  education: [
    {
      degree: 'Degree Name Placeholder',
      institution: 'Institution Name Placeholder',
      location: 'City, State',
      dates: 'Start Date – End Date',
      coursework: ['Course 1', 'Course 2']
    },
    {
      degree: 'Degree Name Placeholder',
      institution: 'Institution Name Placeholder',
      location: 'City, State',
      dates: 'Start Date – End Date',
      coursework: ['Course 1', 'Course 2', 'Course 3']
    }
  ]
};


  private _userProfile = signal<UserProfile>({
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
  });

  private _loading = signal<boolean>(true);
  private _error = signal<string | null>(null);

  readonly userProfile = this._userProfile.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    this.initializeFirestoreListener();
  }

  private initializeFirestoreListener(): void {
    const userDocRef = doc(this.firestore, 'userProfiles', this.USER_PROFILE_ID);

    onSnapshot(
      userDocRef,
      async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as UserProfile;
          this._userProfile.set(data);
          this._loading.set(false);
          this._error.set(null);
        } else {
          await this.initializeDefaultProfile();
        }
      },
      (error) => {
        console.error('Error fetching user profile:', error);
        this._error.set('Failed to load user profile');
        this._loading.set(false);
      }
    );
  }

  private async initializeDefaultProfile(): Promise<void> {
    try {
      await this.saveToFirestore(this.DEFAULT_PROFILE);
      this._loading.set(false);
      this._error.set(null);
    } catch (error) {
      console.error('Error initializing default profile:', error);
      this._error.set('Failed to initialize profile');
      this._loading.set(false);
    }
  }

  async resetToDefault(): Promise<void> {
    try {
      this._loading.set(true);
      await this.saveToFirestore(this.DEFAULT_PROFILE);
      this._userProfile.set(this.DEFAULT_PROFILE);
      this._error.set(null);
    } catch (error) {
      console.error('Error resetting to default:', error);
      this._error.set('Failed to reset profile');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  private async saveToFirestore(profile: UserProfile): Promise<void> {
    const userDocRef = doc(this.firestore, 'userProfiles', this.USER_PROFILE_ID);
    await setDoc(userDocRef, profile);
  }

  async updateUserProfile(profile: UserProfile): Promise<void> {
    try {
      await this.saveToFirestore(profile);
      this._userProfile.set(profile);
      this._error.set(null);
    } catch (error) {
      console.error('Error updating user profile:', error);
      this._error.set('Failed to update profile');
      throw error;
    }
  }

  async updateUserName(name: string): Promise<void> {
    const updatedProfile = {
      ...this._userProfile(),
      name
    };
    await this.updateUserProfile(updatedProfile);
  }

  async updateUserTitle(title: string): Promise<void> {
    const updatedProfile = {
      ...this._userProfile(),
      title
    };
    await this.updateUserProfile(updatedProfile);
  }

  async updateUserBio(bio: string): Promise<void> {
    const updatedProfile = {
      ...this._userProfile(),
      bio
    };
    await this.updateUserProfile(updatedProfile);
  }

  async updateUserSkills(skills: string[]): Promise<void> {
    const updatedProfile = {
      ...this._userProfile(),
      skills
    };
    await this.updateUserProfile(updatedProfile);
  }

  async updateContactInfo(contactInfo: ContactInfo[]): Promise<void> {
    const updatedProfile = {
      ...this._userProfile(),
      contactInfo
    };
    await this.updateUserProfile(updatedProfile);
  }

  async updateProjectsLink(projectsLink: string): Promise<void> {
    const updatedProfile = {
      ...this._userProfile(),
      projectsLink
    };
    await this.updateUserProfile(updatedProfile);
  }

  async updateEducation(education: Education[]): Promise<void> {
    const updatedProfile = {
      ...this._userProfile(),
      education
    };
    await this.updateUserProfile(updatedProfile);
  }

  async refreshProfile(): Promise<void> {
    try {
      this._loading.set(true);
      const userDocRef = doc(this.firestore, 'userProfiles', this.USER_PROFILE_ID);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as UserProfile;
        this._userProfile.set(data);
        this._error.set(null);
      } else {
        await this.initializeDefaultProfile();
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      this._error.set('Failed to refresh profile');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }
}

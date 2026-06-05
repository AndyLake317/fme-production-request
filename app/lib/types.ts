export type FormState = {
  // Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  heardAbout: string;
  // Production
  productionName: string;
  description: string;
  scriptStatus: string;
  stakeholders: string;
  ndaRequired: string;
  // Schedule
  shootDate: string;
  shootDays: string;
  locationCount: string;
  decisionDeadline: string;
  deliveryDate: string;
  // Location
  street: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  // Scope
  services: string[];
  audioNeeded: string;
  broadcast: string[];
  postNeeded: string;
  // Deliverables
  deliverables: string[];
  accessibility: string[];
  // Talent
  talentNeeded: string;
  talentCount: string;
  talentType: string[];
  talentDemo: string;
  unionPref: string;
  paidAdvertising: string;
  usageYears: string;
  // Brand & Music
  brandAssets: string;
  brandNotes: string;
  musicApproach: string[];
  // Budget
  budgetRange: string;
  // Other
  notes: string;
};

export type UploadedFile = {
  name: string;
  size: number;
  path: string;
};

export const blankForm = (): FormState => ({
  firstName: '', lastName: '', email: '', phone: '',
  company: '', jobTitle: '', heardAbout: '',
  productionName: '', description: '', scriptStatus: '',
  stakeholders: '', ndaRequired: '',
  shootDate: '', shootDays: '', locationCount: '',
  decisionDeadline: '', deliveryDate: '',
  street: '', street2: '', city: '', state: '', zip: '',
  services: [], audioNeeded: '',
  broadcast: [], postNeeded: '',
  deliverables: [], accessibility: [],
  talentNeeded: '', talentCount: '', talentType: [],
  talentDemo: '', unionPref: '',
  paidAdvertising: '', usageYears: '',
  brandAssets: '', brandNotes: '', musicApproach: [],
  budgetRange: '',
  notes: '',
});

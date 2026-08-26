import type {
  Product,
  Review,
  CustomerCase,
  EngineeringIssue,
  CaseMessage,
  User,
} from "../types";

export const currentDeveloper: User = {
  id: "dev-1",
  name: "Alex Developer",
  email: "alex@a3-demo.dev",
  role: "DEVELOPER",
  avatarInitials: "AD",
};

export const currentCustomer: User = {
  id: "cust-1",
  name: "John D.",
  email: "john@a3-demo.dev",
  role: "CUSTOMER",
  avatarInitials: "JD",
};

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Smart Wireless Headphones",
    description:
      "Premium wireless headphones with active noise cancellation, 30hr battery life, and studio-tuned sound. Built for daily commutes, calls, and long listening sessions.",
    category: "Audio",
    price: 129.99,
    image: "headphones",
    features: [
      "Active Noise Cancellation",
      "30 Hour Battery Life",
      "Premium Sound Quality",
      "Bluetooth 5.3",
      "Comfortable Over-Ear Design",
    ],
    status: "PUBLISHED",
    createdAt: "2025-02-11",
    rating: 4.2,
    reviewCount: 108,
  },
  {
    id: "prod-2",
    name: "Smart Watch X1",
    description:
      "Fitness-focused smartwatch with heart rate tracking, sleep analysis, and a 6-day battery. Water resistant to 50m.",
    category: "Wearables",
    price: 199.99,
    image: "watch",
    features: ["Heart Rate Monitor", "Sleep Tracking", "6-Day Battery", "50m Water Resistant"],
    status: "PUBLISHED",
    createdAt: "2025-01-22",
    rating: 4.6,
    reviewCount: 96,
  },
  {
    id: "prod-3",
    name: "PowerBank Pro 20K",
    description:
      "20,000mAh portable charger with 65W fast charging for laptops, phones, and tablets. Slim aluminum body.",
    category: "Accessories",
    price: 49.99,
    image: "powerbank",
    features: ["20,000mAh Capacity", "65W Fast Charging", "USB-C PD", "Aluminum Body"],
    status: "PUBLISHED",
    createdAt: "2025-03-02",
    rating: 4.1,
    reviewCount: 78,
  },
  {
    id: "prod-4",
    name: "Wireless Earbuds",
    description: "Compact true-wireless earbuds with adaptive EQ and a pocket-sized charging case.",
    category: "Audio",
    price: 79.99,
    image: "earbuds",
    features: ["Adaptive EQ", "24hr Total Battery", "IPX4 Sweat Resistant", "Touch Controls"],
    status: "PUBLISHED",
    createdAt: "2025-03-18",
    rating: 4.3,
    reviewCount: 158,
  },
  {
    id: "prod-5",
    name: "Laptop Stand Pro",
    description: "Adjustable aluminum laptop stand with 6 height settings and passive cooling vents.",
    category: "Accessories",
    price: 36.99,
    image: "stand",
    features: ["6 Height Settings", "Aluminum Build", "Foldable", "Non-Slip Base"],
    status: "PUBLISHED",
    createdAt: "2025-02-27",
    rating: 4.7,
    reviewCount: 64,
  },
  {
    id: "prod-6",
    name: "Phone Case Premium",
    description: "Drop-tested protective case with raised edges and a soft-touch matte finish.",
    category: "Accessories",
    price: 25.99,
    image: "phonecase",
    features: ["Drop Tested to 3m", "Raised Camera Edge", "Soft-Touch Finish", "Wireless Charging Compatible"],
    status: "PUBLISHED",
    createdAt: "2025-04-01",
    rating: 4.0,
    reviewCount: 43,
  },
];

export const reviews: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    customerId: "cust-1",
    customerName: "John D.",
    rating: 2,
    text: "The headphones worked perfectly at first, but after two weeks the battery barely lasts three hours. They also get unusually warm while charging. Very disappointed.",
    createdAt: "2025-05-18T10:30:00",
  },
  {
    id: "rev-2",
    productId: "prod-1",
    customerId: "cust-2",
    customerName: "Sarah M.",
    rating: 4,
    text: "Great sound quality and comfortable to wear. Battery life could be better but overall satisfied.",
    createdAt: "2025-05-17T09:10:00",
  },
  {
    id: "rev-3",
    productId: "prod-1",
    customerId: "cust-3",
    customerName: "Mike R.",
    rating: 5,
    text: "Amazing headphones! Best purchase I've made this year. The noise cancellation is incredible on flights.",
    createdAt: "2025-05-16T14:22:00",
  },
  {
    id: "rev-4",
    productId: "prod-2",
    customerId: "cust-4",
    customerName: "Mike R.",
    rating: 4,
    text: "Solid smartwatch, tracks my runs accurately. Wish the screen was a bit brighter outdoors.",
    createdAt: "2025-05-15T11:00:00",
  },
  {
    id: "rev-5",
    productId: "prod-3",
    customerId: "cust-5",
    customerName: "Emily T.",
    rating: 2,
    text: "Charging cable that came with it stopped working after a week. The power bank itself seems fine when I use my own cable.",
    createdAt: "2025-05-14T08:45:00",
  },
  {
    id: "rev-6",
    productId: "prod-4",
    customerId: "cust-6",
    customerName: "David K.",
    rating: 1,
    text: "Left earbud disconnects constantly during calls. Tried resetting multiple times, no improvement.",
    createdAt: "2025-05-13T16:12:00",
  },
];

export const caseMessages: CaseMessage[] = [
  {
    id: "msg-1",
    caseId: "case-1024",
    sender: "AGENT",
    text: "Thank you for reaching out about this issue. I'm sorry you're experiencing problems with your headphones. I'd like to ask some questions to better understand what's going on.",
    createdAt: "2025-05-18T10:32:00",
  },
  {
    id: "msg-2",
    caseId: "case-1024",
    sender: "AGENT",
    text: "Can you tell me more about:\n• How do you typically charge your headphones?\n• Do you use the original charging cable?\n• How often do you use them?\n• Have you noticed any other issues?",
    createdAt: "2025-05-18T10:33:00",
  },
  {
    id: "msg-3",
    caseId: "case-1024",
    sender: "CUSTOMER",
    text: "I use the original cable and charge them every night, usually for 2-3 hours. I've noticed they get warm even after just charging for an hour.",
    createdAt: "2025-05-18T10:33:00",
  },
];

export const customerCases: CustomerCase[] = [
  {
    id: "case-1024",
    reviewId: "rev-1",
    productId: "prod-1",
    productName: "Smart Wireless Headphones",
    customerId: "cust-1",
    customerName: "John D.",
    status: "In Progress",
    severity: "High",
    createdAt: "2025-05-18T10:30:00",
    updatedAt: "2025-05-18T10:33:00",
    originalReviewText:
      "The headphones worked perfectly at first, but after two weeks the battery barely lasts three hours. They also get unusually warm while charging. Very disappointed.",
    originalRating: 2,
    hasEngineeringIssue: true,
    analysis: {
      sentiment: "Negative",
      emotion: "Frustrated",
      severity: "High",
      category: "Battery / Charging",
      rootCause: "Possible battery degradation / charging controller issue",
      customerProblem:
        "Battery life dropped sharply after two weeks of normal use, and the unit runs unusually warm while charging.",
      safetyConcern: true,
      confidence: 0.85,
      missingInformation: ["Usage patterns", "Charging habits"],
    },
    memory: {
      knownFacts: [
        "Using original cable",
        "Charges every night",
        "Usage: 2-3 hours daily",
        "Issue after 2 weeks",
        "Heats up during charging",
      ],
      openQuestions: [
        "Charging environment?",
        "Full charge duration?",
        "Battery level when unplugged?",
        "Any physical damage?",
      ],
      currentHypothesis:
        "Battery degradation or charging controller issue causing heat and poor battery life.",
    },
  },
  {
    id: "case-1023",
    reviewId: "rev-5",
    productId: "prod-3",
    productName: "PowerBank Pro 20K",
    customerId: "cust-5",
    customerName: "Sarah M.",
    status: "In Progress",
    severity: "Medium",
    createdAt: "2025-05-17T09:15:00",
    updatedAt: "2025-05-18T09:00:00",
    originalReviewText:
      "Charging cable that came with it stopped working after a week. The power bank itself seems fine when I use my own cable.",
    originalRating: 2,
    hasEngineeringIssue: false,
    analysis: {
      sentiment: "Negative",
      emotion: "Mildly annoyed",
      severity: "Medium",
      category: "Accessory Quality",
      rootCause: "Bundled cable manufacturing defect",
      customerProblem: "The included charging cable failed after approximately one week of use.",
      safetyConcern: false,
      confidence: 0.78,
      missingInformation: ["Cable failure symptoms", "Batch/lot number"],
    },
    memory: {
      knownFacts: ["Cable failed after 1 week", "Power bank works with other cables"],
      openQuestions: ["Exact failure symptom (frayed, no power, intermittent)?", "Where was it stored?"],
      currentHypothesis: "Isolated defective unit in the bundled cable batch.",
    },
  },
  {
    id: "case-1022",
    reviewId: "rev-4",
    productId: "prod-2",
    productName: "Smart Watch X1",
    customerId: "cust-4",
    customerName: "Mike R.",
    status: "Waiting Response",
    severity: "High",
    createdAt: "2025-05-16T14:25:00",
    updatedAt: "2025-05-17T10:00:00",
    originalReviewText:
      "Screen is very hard to read outdoors in direct sunlight, and the GPS seems to lose signal on runs near tall buildings.",
    originalRating: 2,
    hasEngineeringIssue: false,
    analysis: {
      sentiment: "Negative",
      emotion: "Frustrated",
      severity: "High",
      category: "Display / GPS",
      rootCause: "Insufficient outdoor brightness calibration and GPS reacquisition delay",
      customerProblem: "Screen visibility in sunlight and GPS drops near urban obstructions.",
      safetyConcern: false,
      confidence: 0.71,
      missingInformation: ["Brightness setting used", "Specific run locations"],
    },
    memory: {
      knownFacts: ["Issue occurs outdoors in direct sun", "GPS drops near tall buildings"],
      openQuestions: ["Current brightness/auto-brightness setting?", "Firmware version installed?"],
      currentHypothesis: "Auto-brightness curve too conservative outdoors; GPS multipath near buildings.",
    },
  },
  {
    id: "case-1021",
    reviewId: "rev-6",
    productId: "prod-4",
    productName: "Wireless Earbuds",
    customerId: "cust-6",
    customerName: "Emily T.",
    status: "Resolved",
    severity: "Low",
    createdAt: "2025-05-15T16:12:00",
    updatedAt: "2025-05-16T12:00:00",
    originalReviewText:
      "Left earbud disconnects constantly during calls. Tried resetting multiple times, no improvement.",
    originalRating: 1,
    hasEngineeringIssue: false,
    analysis: {
      sentiment: "Negative",
      emotion: "Frustrated",
      severity: "Low",
      category: "Connectivity",
      rootCause: "Bluetooth pairing cache conflict",
      customerProblem: "Left earbud repeatedly disconnects during phone calls.",
      safetyConcern: false,
      confidence: 0.66,
      missingInformation: [],
    },
    memory: {
      knownFacts: ["Issue is isolated to left earbud", "Occurs specifically during calls", "Reset did not fix it"],
      openQuestions: [],
      currentHypothesis: "Resolved via full unpair and re-pair with case firmware update.",
    },
  },
  {
    id: "case-1020",
    reviewId: "rev-1",
    productId: "prod-1",
    productName: "Smart Wireless Headphones",
    customerId: "cust-7",
    customerName: "David K.",
    status: "In Progress",
    severity: "Critical",
    createdAt: "2025-05-13T08:00:00",
    updatedAt: "2025-05-14T09:30:00",
    originalReviewText:
      "One ear cup became extremely hot during a call and I had to take them off. This feels unsafe.",
    originalRating: 1,
    hasEngineeringIssue: false,
    analysis: {
      sentiment: "Negative",
      emotion: "Alarmed",
      severity: "Critical",
      category: "Battery / Charging",
      rootCause: "Potential thermal runaway risk in battery cell",
      customerProblem: "Unit became extremely hot during use, prompting the customer to remove it immediately.",
      safetyConcern: true,
      confidence: 0.9,
      missingInformation: ["Was it charging during the call?", "Serial number / batch"],
    },
    memory: {
      knownFacts: ["Overheating occurred during a call, not while charging", "Customer removed the unit immediately"],
      openQuestions: ["Was the unit charging at the time?", "Serial/batch number for defect tracking?"],
      currentHypothesis: "Possible battery cell defect; flagged for urgent safety review.",
    },
  },
];

export const engineeringIssues: EngineeringIssue[] = [
  {
    id: "ISSUE-2025-1024",
    caseId: "case-1024",
    title: "Battery Life Degradation and Overheating in Smart Wireless Headphones",
    severity: "High",
    component: "Battery / Charging System",
    rootCause: "Possible battery degradation or charging controller malfunction",
    customerImpact:
      "High — Product becomes unusable after a short period, and safety concern due to overheating.",
    evidence: [
      "Multiple customers reporting the same issue",
      "Heating during charging, rapid battery drain",
    ],
    reproductionSteps: [
      "Use headphones normally for 1-2 weeks",
      "Charge device overnight",
      "Notice reduced battery life (3 hours vs expected 30 hours)",
      "Device heats up during charging",
    ],
    suggestedInvestigation: [
      "Check battery health and capacity",
      "Review charging circuit design",
      "Test charging controller IC",
      "Validate thermal management",
    ],
    suggestedFix: [
      "Replace faulty battery units",
      "Update charging firmware",
      "Improve thermal management",
    ],
    acceptanceCriteria: [
      "Battery life should be 20+ hours",
      "No overheating during charging",
      "Pass all safety tests",
    ],
    markdownTicket: `## Battery Life Degradation and Overheating in Smart Wireless Headphones

**Severity:** High
**Component:** Battery / Charging System

### Root Cause
Possible battery degradation or charging controller malfunction.

### Customer Impact
High — product becomes unusable after a short period, with a safety concern due to overheating.

### Reproduction Steps
1. Use headphones normally for 1-2 weeks
2. Charge device overnight
3. Notice reduced battery life (3 hours vs expected 30 hours)
4. Device heats up during charging

### Suggested Fix
- Replace faulty battery units
- Update charging firmware
- Improve thermal management

### Acceptance Criteria
- Battery life should be 20+ hours
- No overheating during charging
- Pass all safety tests
`,
    status: "Pending Approval",
    createdAt: "2025-05-18T10:35:00",
  },
  {
    id: "ISSUE-2025-1020",
    caseId: "case-1020",
    title: "Critical Overheating of Ear Cup During Active Use",
    severity: "Critical",
    component: "Battery Cell",
    rootCause: "Potential thermal runaway risk in battery cell",
    customerImpact: "Critical — active safety risk to the customer during normal use, not charging.",
    evidence: ["Overheating occurred mid-call, not during charging", "Customer removed unit immediately"],
    reproductionSteps: [
      "Use headphones for an extended call (30+ minutes)",
      "Monitor ear cup surface temperature",
    ],
    suggestedInvestigation: [
      "Pull batch/serial data for affected units",
      "Run thermal imaging under sustained load",
      "Escalate to safety/quality team",
    ],
    suggestedFix: ["Issue safety advisory for affected batch", "Cap sustained draw via firmware limit"],
    acceptanceCriteria: ["Surface temperature stays within safe operating range under sustained load"],
    markdownTicket: `## Critical Overheating of Ear Cup During Active Use

**Severity:** Critical
**Component:** Battery Cell

### Root Cause
Potential thermal runaway risk in battery cell.

### Customer Impact
Critical — active safety risk to the customer during normal use, not charging.
`,
    status: "Pending Approval",
    createdAt: "2025-05-14T09:35:00",
  },
];

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getReviewsForProduct(productId: string) {
  return reviews.filter((r) => r.productId === productId);
}

export function getCaseById(id: string) {
  return customerCases.find((c) => c.id === id);
}

export function getMessagesForCase(caseId: string) {
  return caseMessages.filter((m) => m.caseId === caseId);
}

export function getIssueForCase(caseId: string) {
  return engineeringIssues.find((i) => i.caseId === caseId);
}

export function getIssueById(id: string) {
  return engineeringIssues.find((i) => i.id === id);
}

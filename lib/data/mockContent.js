export const mockMembers = [
  {
    id: "amy-seltzer",
    name: "Amy Seltzer",
    title: "General Counsel, Lumenis",
    email: "amy.seltzer@example.com",
    linkedin: "https://linkedin.com/in/amyseltzer",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    location: "London",
    sector: "Technology",
    organisation: "Lumenis",
    jobLevel: "Executive",
    status: "approved",
    role: "member",
    show_in_directory: true,
  },
  {
    id: "brian-mcclean",
    name: "Brian McClean",
    title: "Chief Legal Officer, Long Company Name",
    email: "brian.mcclean@example.com",
    linkedin: "https://linkedin.com/in/brianmcclean",
    avatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
    location: "Cambridge",
    sector: "Financial",
    organisation: "Long Company Name",
    jobLevel: "Executive",
    status: "approved",
    role: "member",
    show_in_directory: true,
  },
  {
    id: "claire-smith",
    name: "Claire Smith",
    title: "Director of Legal Operations, Halo",
    email: "claire.smith@example.com",
    linkedin: "https://linkedin.com/in/clairesmith",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80",
    location: "Bristol",
    sector: "Life Sciences",
    organisation: "Halo",
    jobLevel: "Director",
    status: "approved",
    role: "member",
    show_in_directory: true,
  },
  {
    id: "danielle-pareira",
    name: "Danielle Pareira",
    title: "VP Legal, Synapse",
    email: "danielle.pareira@example.com",
    linkedin: "https://linkedin.com/in/daniellepareira",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    location: "Norwich",
    sector: "Private Equity",
    organisation: "Synapse",
    jobLevel: "VP",
    status: "pending",
    role: "member",
    show_in_directory: true,
  },
  {
    id: "ed-fortworth",
    name: "Ed Fortworth",
    title: "Head of Legal, Cavendish",
    email: "ed.fortworth@example.com",
    linkedin: "https://linkedin.com/in/edfortworth",
    avatar:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80",
    location: "London",
    sector: "Real Estate",
    organisation: "Cavendish",
    jobLevel: "Director",
    status: "suspended",
    role: "member",
    show_in_directory: false,
  },
  {
    id: "erin-oconnor",
    name: "Erin O'Conner",
    title: "Senior Counsel, Northbridge",
    email: "erin.oconnor@example.com",
    linkedin: "https://linkedin.com/in/erinoconnor",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
    location: "London",
    sector: "Professional Services",
    organisation: "Northbridge",
    jobLevel: "Senior Counsel",
    status: "approved",
    role: "member",
    show_in_directory: true,
  },
];

export const mockPartners = [
  {
    id: "adrian-seagers",
    name: "Adrian Seagers",
    title: "Corporate & Commercial Law",
    bio: "Adrian is a highly experienced corporate lawyer with over 20 years of expertise in advising on complex commercial transactions, mergers and acquisitions, and corporate governance matters.",
    avatar:
      "https://images.unsplash.com/photo-1544723795-432537f61035?auto=format&fit=crop&w=600&q=80",
    email: "adrian.seagers@birketts.co.uk",
    phone: "+44 20 7123 0001",
    linkedin: "https://www.linkedin.com/in/adrianseagers",
    show_on_team: true,
    is_author: true,
  },
  {
    id: "maria-peyman",
    name: "Maria-Christina Peyman",
    title: "Head of Intellectual Property",
    bio: "Maria advises on IP strategy, brand protection, and cross-border licensing for international businesses.",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    email: "maria.peyman@birketts.co.uk",
    phone: "+44 20 7123 0002",
    linkedin: "https://www.linkedin.com/in/mariapeyman",
    show_on_team: true,
    is_author: true,
  },
  {
    id: "josh-ripman",
    name: "Josh Ripman",
    title: "Partner",
    bio: "Josh collaborates with scale-ups and FTSE organizations on corporate governance and strategic initiatives.",
    avatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
    email: "josh.ripman@birketts.co.uk",
    phone: "+44 20 7123 0003",
    linkedin: "https://www.linkedin.com/in/joshripman",
    show_on_team: true,
    is_author: false,
  },
  {
    id: "matthew-powell",
    name: "Matthew Powell",
    title: "Legal Director",
    bio: "Matthew leads on disputes, investigations, and regulatory change programs.",
    avatar:
      "https://images.unsplash.com/photo-1504595403659-9088ce801e29?auto=format&fit=crop&w=600&q=80",
    email: "matthew.powell@birketts.co.uk",
    phone: "+44 20 7123 0004",
    linkedin: "https://www.linkedin.com/in/matthewpowell",
    show_on_team: true,
    is_author: false,
  },
  {
    id: "sam-greenhalgh",
    name: "Sam Greenhalgh",
    title: "Partner",
    bio: "Sam partners with global counsel teams navigating technology transformation and AI governance.",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80",
    email: "sam.greenhalgh@birketts.co.uk",
    phone: "+44 20 7123 0005",
    linkedin: "https://www.linkedin.com/in/samgreenhalgh",
    show_on_team: true,
    is_author: false,
  },
];

export const mockArticles = [
  {
    id: "horizon-intellectual-property",
    title: "Horizon: intellectual property issues for 2026 and beyond",
    category: "Real Estate",
    author: "Maria Peyman",
    date: "2025-12-09",
    tags: ["Legislation", "AI"],
    featured: true,
    excerpt:
      "The UPC is gaining traction across Europe, with businesses assessing whether to opt into unified patent coverage.",
    content: [
      {
        heading: "UPC and the English courts",
        body: "The Unified Patent Court (UPC) is gaining traction ...",
      },
      {
        heading: "Legislative changes",
        body: "There are arguments being put forward that the only way to address the issues ...",
      },
      {
        heading: "Clarification of Authorship",
        body: "The rise of generative AI has blurred traditional notions of authorship ...",
      },
      {
        heading: "Geographical indications",
        body: "Geographical indications (GIs) continue to gain importance as consumers value authenticity ...",
      },
      {
        heading: "Greenwashing and IP registration",
        body: "Sustainability claims are under increasing scrutiny ...",
      },
    ],
  },
  {
    id: "landlord-service-charge",
    title: "Court of Appeal clarifies the limits of landlord discretion in service charge disputes",
    category: "Real Estate",
    author: "Multiple",
    date: "2025-12-09",
    tags: ["Real Estate"],
    featured: true,
    excerpt:
      "Key takeaways for in-house counsel overseeing commercial property portfolios.",
  },
];

export const mockResources = [
  {
    id: "resource-horizon-ip",
    slug: "horizon-intellectual-property-issues",
    title: "Horizon: intellectual property issues for 2026 and beyond",
    type: "article",
    category: "Technology",
    categorySlug: "technology",
    intro:
      "A forward look at the IP flashpoints that in-house teams will need to navigate as AI-native products ship at scale.",
    summary:
      "We unpack regulatory trends, dispute readiness, and collaboration models that help legal leaders protect innovation without blocking delivery.",
    tags: ["technology", "intellectual-property", "ai"],
    contentHtml: `
      <p>A surge of AI-native launches is rewriting the typical intellectual property playbook for in-house teams.</p>
      <p>Firms should refresh their invention disclosure processes, revisit portfolio heatmaps, and pair product managers with IP counsel much earlier in the cycle.</p>
      <h3>Key questions for GCs</h3>
      <ul>
        <li>Where do collaborative models with vendors expose ownership gaps?</li>
        <li>Which patents should shift from defensive to assertive postures?</li>
        <li>How do we monitor AI training data provenance at scale?</li>
      </ul>
    `,
    heroImageUrl: "/resources/mock-ip.jpg",
    seoTitle: "Horizon IP priorities for 2026",
    seoDescription: "A GC-level overview of the IP priorities created by AI-native product launches.",
    publishedOn: "2025-12-06",
    authors: [
      {
        id: "mock-maria",
        full_name: "Maria Peyman",
        role: "editor",
        organisation: "Birketts",
        avatar_url: null,
      },
    ],
  },
  {
    id: "resource-video-ai-briefing",
    slug: "gc-video-ai-briefing",
    title: "AI risk briefing for GCs (video)",
    type: "video",
    category: "Technology",
    categorySlug: "technology",
    intro: "15-minute YouTube overview on AI governance playbooks for in-house teams.",
    summary: "Watch the latest GC Forum session on AI risk, with practical steps to align policy, procurement, and engineering.",
    tags: ["ai", "governance"],
    contentHtml: "",
    heroImageUrl: "/resources/mock-video.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    seoTitle: "AI risk briefing for GCs",
    seoDescription: "Video walk-through of AI governance for in-house teams.",
    publishedOn: "2025-12-10",
    authors: [
      {
        id: "mock-ella",
        full_name: "Ella Johnson",
        role: "editor",
        organisation: "Birketts",
        avatar_url: null,
      },
    ],
  },
  {
    id: "resource-landlord-limits",
    slug: "landlord-service-charge-limits",
    title: "Court of Appeal clarifies the limits of landlord discretion in service charge disputes",
    type: "article",
    category: "Real Estate",
    categorySlug: "real-estate",
    intro: "A practical briefing on how the latest ruling reshapes negotiation strategies for occupier GCs.",
    summary:
      "Discover the new decision tree for contesting discretionary service charge uplifts and how to prepare evidence quickly.",
    tags: ["real-estate", "litigation", "disputes"],
    contentHtml: `
      <p>The Court of Appeal has provided much-needed clarity on when landlords can rely on broad discretion clauses.</p>
      <p>In practice, occupiers should reassess escalation pathways and refresh template correspondence where caps are referenced.</p>
      <table>
        <thead>
          <tr><th>Scenario</th><th>Recommended GC action</th></tr>
        </thead>
        <tbody>
          <tr><td>Linked party procurement</td><td>Request disclosure pack and insist on benchmarking</td></tr>
          <tr><td>Soft services uplift</td><td>Run variance analysis against CPI and cite the judgment</td></tr>
        </tbody>
      </table>
    `,
    heroImageUrl: "/resources/mock-service-charge.jpg",
    seoTitle: "Service charge discretion clarified",
    seoDescription: "What the latest Court of Appeal judgment means for occupier legal teams.",
    publishedOn: "2025-12-09",
    authors: [
      {
        id: "mock-natalie",
        full_name: "Natalie Priestly",
        role: "editor",
        organisation: "Birketts",
        avatar_url: null,
      },
      {
        id: "mock-leo",
        full_name: "Leo Martin",
        role: "editor",
        organisation: "Birketts",
        avatar_url: null,
      },
    ],
  },
  {
    id: "resource-training",
    slug: "in-house-team-structure-development",
    title: "In-house team structure and development",
    type: "article",
    category: "People",
    categorySlug: "people",
    intro: "Toolkit for mapping capability gaps and setting a development roadmap in 2026.",
    summary:
      "Use our diagnostic to map workflows, document ownership, and prioritise the enablement tracks that deliver the highest impact.",
    tags: ["people", "leadership", "training"],
    contentHtml: `
      <p>GC Forum members submitted their most common operating model questions across 2025.</p>
      <p>This article packages the playbooks, templates, and capability models shared during those sessions.</p>
      <ol>
        <li>Map requests against business units.</li>
        <li>Assign an accountable owner for every recurring workflow.</li>
        <li>Spin up enablement sprints with measurable KPIs.</li>
      </ol>
    `,
    heroImageUrl: "/resources/mock-training.jpg",
    seoTitle: "In-house legal team development playbook",
    seoDescription: "Practical toolkit for structuring and developing in-house legal teams.",
    publishedOn: "2025-12-09",
    authors: [
      {
        id: "mock-ella",
        full_name: "Ella Johnson",
        role: "editor",
        organisation: "Birketts",
        avatar_url: null,
      },
    ],
  },
];

export const mockEvents = {
  upcoming: [
    {
      id: "event-regulation",
      title: "Regulatory change and horizon scanning",
      category: "Regulation",
      date: "2025-12-20",
      attendees: 10,
      capacity: 15,
      cta: "Book",
    },
    {
      id: "event-training",
      title: "In-House Team Structure and Development",
      category: "Training",
      date: "2025-02-25",
      attendees: 7,
      capacity: 15,
      status: "Booked",
      cta: "Add",
    },
    {
      id: "event-cyber",
      title: "Cybersecurity and Data Breach Response Roundtable",
      category: "Technology",
      date: "2025-03-12",
      attendees: 2,
      capacity: 15,
      cta: "Book",
    },
  ],
  past: [
    {
      id: "event-health-safety",
      title: "Health and safety for GCs",
      category: "Regulation",
      date: "2025-12-02",
      attendees: 10,
      capacity: 15,
      cta: "Watch",
    },
    {
      id: "event-litigation",
      title: "Litigation risk and dispute readiness",
      category: "Law",
      date: "2024-03-12",
      attendees: 2,
      capacity: 15,
      cta: "Watch",
    },
  ],
};

export const mockStats = [
  { id: "years", label: "years of legal excellence and trusted advice", value: "125+" },
  { id: "experts", label: "expert lawyers and support staff", value: "700+" },
  { id: "offices", label: "offices across the U.K", value: "7" },
  { id: "revenue", label: "revenue (2024/2025)", value: "£120m" },
];

export const mockHomepage = {
  hero: {
    eyebrow: "Welcome to the Birketts GC Forum",
    title: "Access insights, resources, and events created for general counsel leaders.",
    copy:
      "Led by Birketts Partners and Legal Directors, the GC Forum has been designed with feedback from general counsel clients to share insights, challenges, and make meaningful connections.",
    ctaPrimary: { label: "Apply to join", href: "/join#apply" },
    ctaSecondary: { label: "Contact the team", href: "/about" },
  },
  highlights: [
    {
      id: "network",
      title: "Networking",
      body: "Connect with fellow GCs and senior legal leaders.",
    },
    {
      id: "resources",
      title: "Resources",
      body: "Access exclusive legal updates, templates, and training.",
    },
    {
      id: "events",
      title: "Events",
      body: "Participate in roundtables, breakfasts, and an annual summit.",
    },
    {
      id: "support",
      title: "Support",
      body: "Gain expert guidance from Birketts partners and the GC community.",
    },
  ],
  contact: {
    title: "How can we help?",
    description:
      "Let us know what resources you'd like to see, the events you want to attend, and the topics you need covered.",
  },
};

export const legalContactEmail = "info@juggle.com";

export type PolicySection = {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
  afterItems?: string[];
};

export const privacySections: PolicySection[] = [
  {
    id: "scope",
    title: "1. About this notice",
    paragraphs: [
      "This notice explains how Juggle, the custom schedule template builder, handles information when you take the quiz, download or print a schedule, or contact us.",
      `Juggle is operated by Juggle Inc. If you have a question about this notice, write to us at ${legalContactEmail}.`,
    ],
  },
  {
    id: "information",
    title: "2. Information covered",
    paragraphs: [
      "Information relevant to Juggle may include the planning preferences you choose in the quiz, the content of your schedule, and contact details or messages you voluntarily send to us. Avoid entering sensitive personal information into a schedule or message unless it is necessary.",
      "We only ask for the planning answers you choose in the quiz; nothing else is needed to build your schedule. If you email us, we receive your message and the address you sent it from.",
    ],
  },
  {
    id: "purposes",
    title: "3. Purposes of use",
    paragraphs: [
      "We use information to create the schedule you ask for, answer your questions, keep Juggle running, and investigate problems when something goes wrong.",
      "If you create an account or subscribe to a newsletter, we’ll explain how that information is used when you sign up.",
    ],
  },
  {
    id: "providers",
    title: "4. Providers and sharing",
    paragraphs: [
      "We share information only with the providers that help us operate Juggle, and only what they need to do their job. Third-party links and resources are governed by their own notices.",
      "We don’t sell your personal information.",
    ],
  },
  {
    id: "retention",
    title: "5. Retention and downloaded schedules",
    paragraphs: [
      "We keep information only as long as needed to provide the service or as the law requires.",
      "You control copies you download or print. Consider where you save a schedule and who can see it, especially when it contains personal details. Deleting a copy from your own device does not establish whether a service holds any other copy.",
    ],
  },
  {
    id: "choices",
    title: "6. Your choices and requests",
    paragraphs: [
      "Depending on your location and the processing involved, applicable law may give you rights to request access, correction, deletion, restriction, objection, or a portable copy of personal information. Where processing relies on consent, applicable law may allow you to withdraw that consent.",
      "Contact us using the address below to ask about these rights or the information associated with you. We may need enough information to verify your request. Legal exceptions may affect the response, and you may be able to contact your local privacy regulator.",
    ],
  },
  {
    id: "cookies-children-changes",
    title: "7. Cookies, children, and updates",
    paragraphs: [
      "See our Cookie Policy for how browser technologies work on Juggle. Juggle is intended for people aged 13 and over, and anyone under 18 needs a parent or guardian’s permission.",
      "We update this notice when our practices change and note the effective date at the top of the page.",
    ],
  },
];

export const termsSections: PolicySection[] = [
  {
    id: "welcome",
    title: "1. Welcome to Juggle",
    paragraphs: [
      "These Terms of Service (“Terms”) are an agreement between you and Juggle Inc (“Juggle,” “we,” “us”). By using our website and services (the “Service”), you agree to these Terms. If you don’t agree, please don’t use Juggle.",
    ],
  },
  {
    id: "who-can-use",
    title: "2. Who can use Juggle",
    paragraphs: [
      "You must be at least 13 years old to use Juggle. If you’re under 18, you need permission from a parent or guardian, who agrees to these Terms on your behalf. By using Juggle, you confirm that you meet these requirements.",
    ],
  },
  {
    id: "account",
    title: "3. Your account",
    items: [
      "You can use the quiz without an account, but saving templates, notifications and profile features require one.",
      "Give accurate information and keep your login details secure.",
      `You’re responsible for activity on your account. Tell us right away at ${legalContactEmail} if you suspect unauthorized access.`,
      "You can delete your account anytime in Profile Settings.",
    ],
  },
  {
    id: "templates-content",
    title: "4. Your templates and content",
    items: [
      "Your schedules belong to you. The templates generated for you are yours to download, print and use for personal, non-commercial purposes.",
      "Information you add (like quiz answers and profile details) stays yours. You give us a limited license to store and process it only so we can provide the Service.",
      "You may not resell, redistribute or claim Juggle’s template designs as your own as a commercial product without our written permission.",
    ],
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable use",
    paragraphs: ["When using Juggle, you agree not to:"],
    items: [
      "Break any law or violate anyone’s rights",
      "Hack, overload, disrupt or try to gain unauthorized access to the Service",
      "Use bots, scrapers or automated tools to access or copy the Service",
      "Upload harmful code, spam or offensive content",
      "Impersonate others or misrepresent your identity",
      "Reverse-engineer or copy the Service to build a competing product",
    ],
    afterItems: ["We may suspend or end accounts that break these rules."],
  },

  {
    id: "intellectual-property",
    title: "6. Our intellectual property",
    paragraphs: [
      "The Juggle name, logo, website design, template designs, illustrations and software are owned by Juggle Inc and protected by intellectual property laws. Apart from the personal-use rights described above, these Terms don’t give you any rights to them.",
    ],
  },
  {
    id: "communications",
    title: "7. Notifications and communications",
    paragraphs: [
      "By creating an account, you agree to receive essential service emails (like password resets and important account updates). Reminders and newsletters are optional, and you can turn them off anytime.",
    ],
  },
  {
    id: "free-service",
    title: "8. Free service and changes",
    paragraphs: [
      "Juggle is currently free to use. We may add, change or remove features, or introduce paid plans in the future. If we introduce paid features, we’ll clearly tell you the price and terms before you’re charged.",
    ],
  },
  {
    id: "disclaimer",
    title: "9. Disclaimer",
    paragraphs: [
      "Juggle is provided “as is” and “as available.” We work hard to keep it running smoothly, but we don’t guarantee that the Service will always be available, error-free or perfectly suited to your needs. Schedule templates are planning tools only and are not professional, medical, educational or productivity advice. To the fullest extent permitted by law, we disclaim all warranties, express or implied.",
    ],
  },
  {
    id: "liability",
    title: "10. Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, Juggle and Juggle Inc will not be liable for any indirect, incidental, special, consequential or punitive damages, or for any lost data, profits or missed appointments, arising from your use of the Service. Our total liability for any claim will not exceed the greater of the amount you paid us in the past 12 months or $50 USD. Some places don’t allow these limits, so they may not fully apply to you.",
    ],
  },
  {
    id: "indemnification",
    title: "11. Indemnification",
    paragraphs: [
      "You agree to defend and hold harmless Juggle from claims arising from your misuse of the Service or violation of these Terms.",
    ],
  },
  {
    id: "ending-use",
    title: "12. Ending your use",
    paragraphs: [
      "You can stop using Juggle and delete your account at any time. We may suspend or terminate your access if you violate these Terms or if we’re required to by law. Sections that by their nature should survive (like ownership, disclaimers and limitation of liability) will continue to apply.",
    ],
  },
  {
    id: "governing-law",
    title: "13. Governing law",
    paragraphs: [
      "These Terms are governed by the laws of Missouri, USA, without regard to conflict-of-law principles. Any disputes will be handled in the courts located in Missouri, USA, unless the law where you live requires otherwise.",
    ],
  },
  {
    id: "changes",
    title: "14. Changes to these Terms",
    paragraphs: [
      "We may update these Terms from time to time. If changes are significant, we’ll let you know by email or a notice on the site. Continuing to use Juggle after changes take effect means you accept the updated Terms.",
    ],
  },
  {
    id: "contact-us",
    title: "15. Contact us",
    paragraphs: [
      `Questions about these Terms? Email ${legalContactEmail}.`,
      "These Terms are offered by Juggle Inc.",
    ],
  },
];

export const cookieSections: PolicySection[] = [
  {
    id: "scope",
    title: "1. About this policy",
    paragraphs: [
      "This policy explains the cookies and similar technologies Juggle uses and the choices you have in your own browser.",
      "We use the smallest set of technologies that lets Juggle work, and the categories below explain what each one is for.",
    ],
  },
  {
    id: "technologies",
    title: "2. Cookies and similar technologies",
    paragraphs: [
      "Cookies are small pieces of information that a website can store in your browser. Some last only for a browsing session; others can remain until they expire or you delete them. Browser storage and similar technologies may also remember information without using cookies.",
      "First-party cookies are associated with the site you visit. Third-party technologies may involve a separate provider, which we describe where they apply.",
    ],
  },
  {
    id: "categories",
    title: "3. Cookie categories",
    paragraphs: ["These are the categories of cookie Juggle may use, grouped by what each one does."],
    items: [
      "Necessary: technologies required for a specifically requested service, such as a session or security function.",
      "Preferences: technologies that remember a choice, such as a display setting.",
      "Analytics: technologies that measure visits or use of a service.",
      "Advertising: technologies that support advertising or tracking across services.",
    ],
  },
  {
    id: "inventory",
    title: "4. Cookie details and providers",
    paragraphs: [
      "Where a third-party service that helps run Juggle sets a cookie, that provider’s own notice explains how it handles the information.",
      "If you’d like details about a specific cookie on Juggle, ask us at the contact address below and we’ll tell you what we know.",
    ],
  },
  {
    id: "choices",
    title: "5. Your browser choices",
    paragraphs: [
      "Most browsers let you review stored cookies, delete them, and block some or all cookies through privacy settings. Consult your browser’s help documentation for the controls available on your device. Settings may need to be changed separately on each browser or device.",
      "Blocking a technology required for a requested function can affect that function. Deleting browser information does not automatically delete information held elsewhere.",
    ],
  },
  {
    id: "consent",
    title: "6. Consent and preference controls",
    paragraphs: [
      "Where the law requires your consent before we set a technology, we ask for it first and give you a way to change or withdraw that choice.",
      "You can change your choice at any time through your browser settings, and continuing to browse is not treated as consent to optional technologies.",
    ],
  },
  {
    id: "changes",
    title: "7. Updates and privacy",
    paragraphs: [
      "We update this policy when our cookie use changes. Our Privacy Policy explains how we handle personal information.",
    ],
  },
];

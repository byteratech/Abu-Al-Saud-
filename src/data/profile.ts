import { JourneyStage, SocialLinks } from '../types';

export const personalProfile = {
  publicName: {
    ar: 'أبو السعود',
    en: 'Abu Al-Saud',
  },
  officialFullName: {
    ar: 'محمد محمد أبو السعود',
    en: 'Mohamed Mohamed Abu Al-Saud',
  },
  location: {
    ar: 'قنا، مصر',
    en: 'Qena, Egypt',
  },
  timezone: 'Africa/Cairo (GMT+2)',
  email: 'abualss3ud@gmail.com',
  phone: '+201033108223',
  whatsapp: '+201033108223',
  currentFocus: {
    ar: 'أمن تطبيقات الويب، تحليل حركة الشبكات، وإدارة وحماية أنظمة لينكس، مع توثيق التجارب المعملية.',
    en: 'Web Application Security, Network Traffic Analysis, Linux Server Hardening, and CTF Lab Documentation.',
  },
  socialLinks: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    instagram: 'https://instagram.com',
    tiktok: 'https://www.tiktok.com/@abualss3ud',
    x: 'https://x.com',
    whatsapp: 'https://wa.me/201033108223',
    phone: 'tel:+201033108223',
    email: 'abualss3ud@gmail.com',
  } as SocialLinks,
};

export const journeyStages: JourneyStage[] = [
  {
    id: 'branding',
    period: '2020 — 2021',
    title: {
      ar: 'علوم الحاسوب وأساسيات البرمجة',
      en: 'Computer Science & Programming Basics',
    },
    subtitle: {
      ar: 'البداية في عالم الخوارزميات وهياكل البيانات والمنطق البرمجي',
      en: 'Algorithmic logic, data structures & programming fundamentals',
    },
    description: {
      ar: 'انطلقت المسيرة بتعلم أسس علوم الحاسوب، حل المشكلات برمجياً، الخوارزميات الأساسية، والبرمجة كائنية التوجه (OOP) لبناء أساس متين ومرن.',
      en: 'Started with computer science fundamentals, algorithmic problem solving, basic data structures, and object-oriented programming principles.',
    },
    skills: ['Algorithms', 'Data Structures', 'OOP', 'Problem Solving', 'C++', 'Python'],
    whatChanged: {
      ar: 'الرغبة في الانتقال من البرمجة النظرية وحل التحديات إلى بناء تطبيقات ويب تفاعلية كاملة تخدم المستخدمين.',
      en: 'Driven to transition from abstract programming to building live, interactive, full-featured web applications.',
    },
    whatLearned: {
      ar: 'المنطق البرمجي السليم، تنظيم البيانات، وكتابة أكواد نظيفة وقابلة للتطوير.',
      en: 'Strong programmatic logic, data organization, and the discipline of writing clean, maintainable code.',
    },
  },
  {
    id: 'uiux',
    period: '2021 — 2022',
    title: {
      ar: 'تطوير الويب المتكامل (Full-Stack)',
      en: 'Full-Stack Web Development',
    },
    subtitle: {
      ar: 'بناء واجهات تفاعلية وقواعد بيانات وخوادم متكاملة',
      en: 'Designing databases, full-stack architectures & interactive products',
    },
    description: {
      ar: 'التركيز على تطوير الواجهات الأمامية والأنظمة الخلفية (Backend)، تصميم قواعد البيانات البرمجية، كتابة خوادم الـ API، والتعامل مع نظم التشغيل وبيئات الاستضافة.',
      en: 'Focused on developing full-stack applications, relational and non-relational database design, secure API development, and deployment workflows.',
    },
    skills: ['Full-Stack Dev', 'REST APIs', 'SQL / NoSQL', 'Server Logic', 'Node.js', 'Express'],
    whatChanged: {
      ar: 'الرغبة في فهم كيفية تأمين هذه الخوادم والشبكات المستضيفة وإدارتها باحترافية ضد المخاطر والهجمات الرقمية.',
      en: 'Motivated to master server hardening, network topologies, and infrastructure security against exploits.',
    },
    whatLearned: {
      ar: 'معمارية الويب، دمج الخدمات والأنظمة البرمجية، ووعي هندسي بكفاءة نقل وتخزين البيانات.',
      en: 'Systems architecture, multi-tier software design, database optimization, and high-performance routing.',
    },
  },
  {
    id: 'webdev',
    period: '2022 — 2024',
    title: {
      ar: 'تطوير الويب والبرمجة',
      en: 'Web Development & Frontend',
    },
    subtitle: {
      ar: 'بناء التطبيقات الحية وتكامل واجهات البرمجة',
      en: 'Building scalable responsive applications with modern frameworks',
    },
    description: {
      ar: 'تعلم البرمجة وهندسة الويب، والعمل المكثف مع JavaScript و TypeScript و React و Next.js و Tailwind CSS، والتعامل مع بروتوكولات الويب وواجهات الـ REST APIs.',
      en: 'Mastered frontend engineering with modern TypeScript, React, Next.js, and CSS architectures, consuming APIs, managing state, and optimizing performance.',
    },
    skills: ['JavaScript (ES6+)', 'TypeScript', 'React.js', 'Next.js', 'Tailwind CSS', 'REST APIs', 'Git'],
    whatChanged: {
      ar: 'التساؤل العميق: كيف تُنقل البيانات عبر الشبكة؟ وكيف تحمي التطبيق من التلاعب والثغرات والتهديدات الأمنية؟',
      en: 'Pondering how packets actually traverse networks, how servers respond under pressure, and how code is defended against exploits.',
    },
    whatLearned: {
      ar: 'دورة حياة طلبات HTTP، آليات التخزين المؤقت، التعامل مع الخوادم، وإدارة الحالة في التطبيقات المعقدة.',
      en: 'The HTTP request-response cycle, DOM manipulation, client-server models, and stateful architecture.',
    },
  },
  {
    id: 'it',
    period: '2024 — 2025',
    title: {
      ar: 'تقنية المعلومات وإدارة النظم (IT)',
      en: 'IT & Systems Infrastructure',
    },
    subtitle: {
      ar: 'فهم البنية التحتية، الشبكات، وأنظمة التشغيل',
      en: 'Operating system internals, Linux environments & networking',
    },
    description: {
      ar: 'دراسة متعمقة لبيئات أنظمة تشغيل Linux، بروتوكولات الشبكات (TCP/IP, DNS, DHCP, Routing)، إدارة الصلاحيات، وإدارة الخوادم عبر سطر الأوامر (CLI).',
      en: 'Studying operating system internals, Linux CLI administration, networking models (OSI & TCP/IP), DNS/DHCP infrastructure, and virtualization.',
    },
    skills: ['Linux (Debian/Ubuntu/Arch)', 'Bash Scripting', 'TCP/IP & Networking', 'System Administration', 'Virtualization'],
    whatChanged: {
      ar: 'الرغبة في اختبار متانة البنى التحتية وفهم نقاط الضعف من منظور أمني تحليلي متكامل.',
      en: 'A natural drive to test infrastructure resilience, inspect traffic payloads, and discover vulnerabilities systematically.',
    },
    whatLearned: {
      ar: 'كيفية تحرك البيانات في الشبكة، تقسيم الشبكات (Subnetting)، بنية الملفات في لينكس، وصلاحيات الوصول.',
      en: 'Packet encapsulation, subnet routing, Linux permissions & process management, and network troubleshooting.',
    },
  },
  {
    id: 'cybersecurity',
    period: '2025 — الحاضر',
    title: {
      ar: 'الأمن السيبراني والبحث التقني',
      en: 'Cybersecurity & Security Research',
    },
    subtitle: {
      ar: 'التركيز الحالي: أمن التطبيقات، المعامل، ونشر الوعي',
      en: 'Hands-on lab experiments, vulnerability triage & awareness',
    },
    description: {
      ar: 'التركيز الحالي على أمن تطبيقات الويب (OWASP Top 10)، تحليل الثغرات، حل تحديات CTF، كتابة التقارير التقنية (Write-ups)، وتوعية المجتمع التقني بالأمن الرقمي.',
      en: 'Current deep dedication to Web Application Security, hands-on CTF lab challenges, vulnerability analysis, technical writing, and creating educational cybersecurity awareness content.',
    },
    skills: ['Web Security (OWASP)', 'Network Security', 'Vulnerability Analysis', 'CTF / Security Labs', 'Security Awareness Content', 'Burp Suite & Wireshark'],
    whatChanged: {
      ar: 'اكتمال الرؤية: دمج التفكير التصميمي مع المهارات البرمجية والخبرة في النظم لبناء بيئات آمنة وفهم التهديدات بعمق.',
      en: 'Achieving a complete holistic vision: combining design mindset, coding capability, and systems knowledge to build, audit, and educate.',
    },
    whatLearned: {
      ar: 'الأمن السيبراني ممارسة مستمرة وتفكير نقدي يبدأ من التأسيس الصحيح ولا ينتهي عند أداة معينة.',
      en: 'Security is a continuous mindset and discipline of deep understanding, curiosity, and persistent experimentation.',
    },
  },
];

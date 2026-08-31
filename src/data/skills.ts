import { SkillCategory } from '../types';

export const skillCategories: SkillCategory[] = [
  {
    id: 'design',
    name: {
      ar: 'الشبكات وبنية الأنظمة',
      en: 'Networks & System Architecture',
    },
    description: {
      ar: 'تأسيس متين في بناء وتصميم الشبكات، معمارية الأنظمة، وإدارة الخوادم وحركة المرور الرقمية.',
      en: 'Solid foundation in computer networking, system topologies, server administration, and packet routing.',
    },
    skills: [
      {
        name: 'Network Architectures & Protocols',
        levelLabel: { ar: 'متقدم', en: 'Advanced' },
        description: { ar: 'تكوين بنية الشبكات، بروتوكولات TCP/IP، وتحليل حركة الحزم', en: 'Configuring network topologies, TCP/IP stack, and packet capture analysis' },
        tags: ['TCP/IP', 'Wireshark', 'Routing & Switching'],
      },
      {
        name: 'Virtualization & Cloud Environments',
        levelLabel: { ar: 'متقدم', en: 'Advanced' },
        description: { ar: 'إعداد الخوادم الافتراضية، بيئات Proxmox، الحاويات ونظم المحاكاة', en: 'Setting up virtualization hypervisors, Proxmox VE, containerization, and virtual LANs' },
        tags: ['Proxmox', 'Docker', 'VLANs', 'VMware'],
      },
      {
        name: 'Active Directory & Identity Management',
        levelLabel: { ar: 'متقدم', en: 'Advanced' },
        description: { ar: 'إدارة وتكوين خوادم ويندوز، الدليل النشط، وإدارة الصلاحيات والمجموعات', en: 'Windows Server configuration, Active Directory Domain Services, policies, and identity access management' },
        tags: ['Windows Server', 'Active Directory', 'GPO', 'IAM'],
      },
      {
        name: 'DNS & Public Infrastructure',
        levelLabel: { ar: 'متقن', en: 'Proficient' },
        description: { ar: 'إدارة سجلات DNS، خوادم الويب، شهادات SSL/TLS، والتوجيه الذكي', en: 'Configuring DNS record structures, reverse proxies, SSL/TLS handshakes, and caching' },
        tags: ['DNS Zone Routing', 'Nginx Reverse Proxy', 'SSL/TLS'],
      },
    ],
  },
  {
    id: 'development',
    name: {
      ar: 'تطوير الويب وهندسة البرمجيات',
      en: 'Web Development & Frontend',
    },
    description: {
      ar: 'بناء تطبيقات الويب التفاعلية الحديثة مع التركيز على الأداء، البنية المعيارية، والأمان.',
      en: 'Building modern responsive web applications with a focus on performance, modularity, and security.',
    },
    skills: [
      {
        name: 'TypeScript & JavaScript (ES6+)',
        levelLabel: { ar: 'متقدم', en: 'Advanced' },
        description: { ar: 'البرمجة كائنية التوجه، الأنماط الصارمة، وإدارة الحالة غير المتزامنة', en: 'Strict typing, asynchronous flows, and modern JavaScript patterns' },
        tags: ['Strict Typing', 'Async/Await', 'ES Modules'],
      },
      {
        name: 'React.js & Next.js Ecosystem',
        levelLabel: { ar: 'متقدم', en: 'Advanced' },
        description: { ar: 'بناء تطبيقات الويب الحديثة، Server Components، والتوجيه الذكي', en: 'Modern SPAs, App Router, hooks architecture, and SSR/SSG' },
        tags: ['React 19', 'Next.js', 'State Hooks'],
      },
      {
        name: 'Tailwind CSS & Responsive UI',
        levelLabel: { ar: 'متقن جداً', en: 'Expert' },
        description: { ar: 'تنسيق الواجهات المتقدم، دعم RTL/LTR، والأنماط الداكنة الدقيقة', en: 'Advanced responsive utility layouts, RTL adaptation, and dark themes' },
        tags: ['Tailwind v4', 'RTL Support', 'Accessible CSS'],
      },
      {
        name: 'REST APIs & Web Protocols',
        levelLabel: { ar: 'متقن', en: 'Proficient' },
        description: { ar: 'التعامل مع بروتوكولات HTTP/HTTPS، كائنات JSON، ورموز JWT', en: 'HTTP request lifecycles, JSON payload contracts, and JWT auth' },
        tags: ['HTTP/1.1 & 2', 'Fetch API', 'JSON'],
      },
      {
        name: 'Git & Version Control',
        levelLabel: { ar: 'متقن', en: 'Proficient' },
        description: { ar: 'إدارة الفروع، سجل التغييرات، والتعاون البرمجي المنظم', en: 'Branching strategies, atomic commits, and repository hygiene' },
        tags: ['GitHub', 'CLI Git', 'CI/CD Basics'],
      },
    ],
  },
  {
    id: 'it',
    name: {
      ar: 'تقنية المعلومات وإدارة النظم (IT)',
      en: 'IT & Systems Infrastructure',
    },
    description: {
      ar: 'فهم عميق لأنظمة التشغيل، الشبكات، بيئات لينكس، وهيكلية الاتصالات السحابية والافتراضية.',
      en: 'Deep understanding of operating systems, networking models, Linux administration, and virtualization.',
    },
    skills: [
      {
        name: 'Linux Systems (Debian, Ubuntu, Arch)',
        levelLabel: { ar: 'عملي ومستمر', en: 'Hands-on & Active' },
        description: { ar: 'إدارة الطرفية (CLI)، صلاحيات الملفات، وحزم النظام والخدمات', en: 'Terminal navigation, file permissions, daemon management, and cron' },
        tags: ['Bash', 'systemd', 'CLI', 'File Permissions'],
      },
      {
        name: 'Computer Networking (TCP/IP, DNS, Routing)',
        levelLabel: { ar: 'تأسيسي قوي', en: 'Strong Foundation' },
        description: { ar: 'نموذج OSI، بروتوكولات TCP/UDP، تقسيم الشبكات (Subnetting)، وتحليل الحزم', en: 'OSI/TCP-IP models, packet traversal, subnetting, and port states' },
        tags: ['TCP/IP', 'DNS', 'DHCP', 'Subnetting', 'Routing'],
      },
      {
        name: 'Virtualization & Containers',
        levelLabel: { ar: 'عملي', en: 'Practical' },
        description: { ar: 'بناء وتشغيل البيئات المعزولة عبر Docker و VirtualBox و VMware', en: 'Container isolation, Docker compose topologies, and virtual test labs' },
        tags: ['Docker', 'VirtualBox', 'VM Isolation'],
      },
      {
        name: 'System Administration & Hardening',
        levelLabel: { ar: 'تطبيقي', en: 'Applied' },
        description: { ar: 'تأمين الخوادم، تكوين SSH الآمن، وإعدادات جدران الحماية UFW/iptables', en: 'Server hardening, SSH key pairs, UFW/iptables firewall rules' },
        tags: ['UFW', 'SSH Hardening', 'Audit Logs'],
      },
    ],
  },
  {
    id: 'security',
    name: {
      ar: 'الأمن السيبراني والبحث التقني',
      en: 'Cybersecurity & Security Research',
    },
    description: {
      ar: 'التركيز الحالي على أمن تطبيقات الويب، تحليل حركة الحزم، حل المختبرات الأمنية، ونشر الوعي.',
      en: 'Current deep focus on Web Application Security, traffic analysis, hands-on lab write-ups, and awareness.',
    },
    skills: [
      {
        name: 'Web Application Security (OWASP Top 10)',
        levelLabel: { ar: 'تركيز مكثف', en: 'Active Focus' },
        description: { ar: 'فهم واختبار ثغرات XSS و SQLi و CSRF و SSRF و IDOR/BOLA و Desync', en: 'Vulnerability triage, authorization flaws, injection, and session hijacks' },
        tags: ['OWASP Top 10', 'BOLA', 'XSS', 'IDOR', 'CSRF'],
      },
      {
        name: 'Traffic Analysis & Wireshark',
        levelLabel: { ar: 'تطبيقي معملي', en: 'Applied Lab' },
        description: { ar: 'التقاط الحزم، فك تشفير البيانات المصرح بها، وتحليل بروتوكولات الاتصال', en: 'Live packet capture, display filters, protocol dissection, and PCAP analysis' },
        tags: ['Wireshark', 'tcpdump', 'Packet Inspection'],
      },
      {
        name: 'Security Tooling & Proxies (Burp Suite)',
        levelLabel: { ar: 'متقن', en: 'Proficient' },
        description: { ar: 'اعتراض طلبات HTTP، تعديل الترويسات، وإعادة الإرسال عبر Repeater', en: 'Intercepting proxies, request manipulation, and automated fuzzing' },
        tags: ['Burp Suite', 'Postman', 'Nmap', 'Browser DevTools'],
      },
      {
        name: 'CTF Challenges & Security Labs',
        levelLabel: { ar: 'مستمر ونشط', en: 'Active Practice' },
        description: { ar: 'حل التحديات في TryHackMe و PortSwigger Web Security Academy والبيئات المحلية', en: 'Hands-on practice on TryHackMe, PortSwigger Academy, and local CTFs' },
        tags: ['TryHackMe', 'PortSwigger', 'Local Labs', 'Write-ups'],
      },
      {
        name: 'Cybersecurity Awareness & Content',
        levelLabel: { ar: 'شغف وممارسة', en: 'Dedicated' },
        description: { ar: 'صناعة محتوى تعليمي وتوعوي مبسط لتبسيط مفاهيم الأمان التقني للجميع', en: 'Creating accessible, informative technical guides and community awareness' },
        tags: ['Technical Writing', 'Community Awareness', 'Educational Content'],
      },
    ],
  },
];

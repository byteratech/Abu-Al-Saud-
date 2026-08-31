import { LabItem } from '../types';

export const labItems: LabItem[] = [
  {
    id: 'lab-http-request-smuggling',
    slug: 'lab-http-request-smuggling',
    category: 'Web Security',
    platform: 'PortSwigger / Local Docker Lab',
    difficulty: 'advanced',
    status: 'completed',
    date: '2026-06-02',
    topics: ['HTTP Desync', 'Transfer-Encoding', 'Content-Length', 'Reverse Proxy', 'Front-End vs Back-End'],
    technologies: ['Burp Suite Repeater', 'Nginx', 'Node.js Backend', 'Wireshark', 'Docker'],
    title: {
      ar: 'معمل: تهريب طلبات HTTP واختلاف التفسير بين الخوادم (CL.TE Desync)',
      en: 'Lab: HTTP Request Smuggling & Header Desynchronization (CL.TE)',
    },
    description: {
      ar: 'تحقيق عملي في كيفية استغلال الاختلاف بين خادم الواجهة الأمامية وخادم الواجهة الخلفية في معالجة ترويسات Content-Length و Transfer-Encoding.',
      en: 'A practical investigation into desynchronizing frontend reverse proxies and backend servers via conflicting Content-Length and Transfer-Encoding headers.',
    },
    writeup: {
      overview: {
        ar: 'في البنى التحتية الحديثة، غالباً ما تقف خوادم وسيطة (Reverse Proxies / Load Balancers) أمام خوادم التطبيقات الخلفية. عندما تختلف طريقة تفسير حدود طلبات HTTP بين هذه الخوادم، يمكن للمهاجم تهريب جزء من طلب يلتصق بطلب المستخدم التالي في الطابور.',
        en: 'In modern distributed web topologies, reverse proxies and load balancers route requests to backend microservices over persistent TCP pipelines. Discrepancies in RFC parsing allow arbitrary request prefixes to be appended to subsequent user requests.',
      },
      objective: {
        ar: 'إثبات وجود ثغرة تهريب الطلبات (CL.TE) في بيئة معملية معزولة واستغلالها لتعديل استجابة الطلب اللاحق.',
        en: 'Demonstrate a CL.TE request smuggling vulnerability in a containerized environment and poison the backend request pipeline safely.',
      },
      environment: {
        ar: 'بيئة Docker مكونة من خادم Nginx 1.14 (كخادم واجهة أمامية يدعم Content-Length) متصل بخادم Node.js HTTP قديم (يفضل Transfer-Encoding: chunked).',
        en: 'Docker Compose cluster: Nginx 1.14 reverse proxy (prioritizing Content-Length) forwarding to an upstream Node.js HTTP backend (prioritizing Transfer-Encoding: chunked).',
      },
      methodology: {
        ar: 'تم استخدام Burp Suite Repeater بعد إيقاف خيار "Update Content-Length automatically" لإرسال ترويسات متضاربة عمداً ومراقبة استجابات الطلبات المتتالية.',
        en: 'Utilized Burp Suite Repeater with automated length calculation disabled to construct dual-header payloads and measure pipelined stream behavior.',
      },
      technicalInvestigation: {
        ar: 'قام خادم الواجهة الأمامية بقراءة طول الطلب بناءً على ترويسة Content-Length (طول 13 بايت)، بينما قام خادم الخلفية بمعالجة الطلب كـ Chunked واعتبر البايت 0 نهاية الطلب الأول، مما ترك الطلب المهرّب \`GPOST /victim\` عالقاً في الـ Buffer الخاص بالاتصال.',
        en: 'The frontend processed the request using Content-Length (13 bytes), while the backend parsed Transfer-Encoding: chunked, treating `0\\r\\n\\r\\n` as the terminal boundary. The remaining chunk prefix remained buffered in the TCP socket.',
      },
      findings: {
        ar: 'نجحت التجربة في جعل الطلب التالي للمستخدم يرجع استجابة 404 بدلاً من الصفحة الرئيسية، مما يثبت إمكانية سرقة بيانات الجلسات أو التلاعب بمسار التوجيه في البيئات غير المحمية.',
        en: 'Successfully poisoned the socket pipeline, forcing the subsequent legitimate request to receive an unauthorized redirect. Proved viability of session capture vectors.',
      },
      lessonsLearned: {
        ar: 'الاعتماد على بروتوكول HTTP/2 من البداية حتى النهاية (End-to-End)، أو تكوين خوادم الواجهة الأمامية لإلغاء أي طلب يحتوي على ترويسات Content-Length و Transfer-Encoding معاً.',
        en: 'Enforce end-to-end HTTP/2 multiplexing or configure reverse proxies to reject any ambiguous requests presenting conflicting length descriptors.',
      },
      references: [
        'RFC 7230: Hypertext Transfer Protocol (HTTP/1.1) Message Syntax and Routing',
        'PortSwigger Web Security Academy: HTTP Request Smuggling',
      ],
      codeSnippets: [
        {
          title: 'Smuggled Payload Structure (Raw HTTP/1.1)',
          language: 'http',
          code: `POST / HTTP/1.1
Host: vulnerable-lab.local
Content-Type: application/x-www-form-urlencoded
Content-Length: 13
Transfer-Encoding: chunked

0

SMUGGLED-PREFIX`,
          explanation: {
            ar: 'الترويسة تخدع الواجهة الأمامية بـ Content-Length بينما تنهي الخلفية الطلب عند الـ 0 وتترك SMUGGLED ملتصقة بالطلب اللاحق.',
            en: 'The dual header confuses the length parser, terminating backend interpretation at the zero chunk and pre-pending SMUGGLED-PREFIX onto the next incoming stream.',
          },
        },
      ],
    },
  },
  {
    id: 'lab-linux-suid-privilege-escalation',
    slug: 'lab-linux-suid-privilege-escalation',
    category: 'Linux / Systems',
    platform: 'Local VM Lab / TryHackMe',
    difficulty: 'intermediate',
    status: 'completed',
    date: '2026-05-14',
    topics: ['Privilege Escalation', 'SUID Binaries', 'GTFOBins', 'File Capabilities', 'Linux Audit'],
    technologies: ['Ubuntu 22.04 LTS', 'Bash', 'LinPEAS', 'GDB', 'systemd'],
    title: {
      ar: 'معمل: تصعيد الصلاحيات في لينكس عبر إساءة تكوين بتات SUID',
      en: 'Lab: Linux Privilege Escalation via SUID Misconfigurations',
    },
    description: {
      ar: 'تحليل بيئة اختبار محلية لاكتشاف البرمجيات التنفيذية التي تحمل صلاحيات الجذر (Root SUID) واستغلال ميزات الهروب من الصدفة للوصول إلى أعلى الصلاحيات.',
      en: 'Auditing a custom Linux target to enumerate root-owned SUID executables and leverage GTFOBins breakout techniques to achieve a root shell.',
    },
    writeup: {
      overview: {
        ar: 'عندما يُمنح برنامج ما بت SUID، فإنه ينفّذ العمليات بصلاحيات مالكه (غالباً root). إذا كان هذا البرنامج يمتلك خيارات لتشغيل أوامر خارجية أو استدعاء محررات نصوص، فإنه يمثل خطراً أمنياً جسيماً.',
        en: 'SUID binaries execute with the privileges of their owner. When binaries with interactive breakout capabilities (such as debuggers or text pagers) are granted SUID, unprivileged users can break out into root shells.',
      },
      objective: {
        ar: 'إجراء تدقيق أمني لنظام الملفات لاكتشاف برامج SUID غير القياسية، وتصعيد الصلاحيات من مستخدم عادي \`developer\` إلى مستخدم \`root\`.',
        en: 'Perform systematic filesystem enumeration to discover non-standard SUID binaries and elevate an unprivileged session to full root access.',
      },
      environment: {
        ar: 'نظام تشغيل Ubuntu 22.04 LTS تم تثبيته كجهاز افتراضي معزول، يحتوي على ثنائي مخصص وثنائي \`find\` معدل بـ SUID.',
        en: 'Isolated Ubuntu 22.04 LTS virtual machine with customized user roles and non-standard binary permissions.',
      },
      methodology: {
        ar: 'استخدام أوامر الاستكشاف اليدوية باستخدام \`find\` مع تجاهل رسائل الخطأ، متبوعة بتحليل سلوك الثنائيات المكتشفة.',
        en: 'Executed automated & manual discovery scripts via `find -perm -4000` filter and evaluated execution capabilities against GTFOBins patterns.',
      },
      technicalInvestigation: {
        ar: 'أظهر الفحص وجود إذن SUID على أمر \`/usr/bin/find\`. يمتلك أمر find معاملاً \`-exec\` يسمح بتنفيذ أوامر صدفة بصلاحيات مالك الملف دون الحاجة لكلمة مرور.',
        en: 'Identified that `/usr/bin/find` retained the SUID bit. Executing `/usr/bin/find . -exec /bin/sh -p \\; -quit` successfully spawned a subshell retaining effective UID 0 (root).',
      },
      findings: {
        ar: 'تم الحصول على صدفة جذر كاملة (Root Shell). كشف الفحص أيضاً أن استخدام قدرات لينكس (Linux Capabilities) مثل \`cap_setuid\` يمثل بديلاً أكثر أماناً من تعيين SUID الكامل إذا كان التطبيق يحتاج لصلاحيات محددة فقط.',
        en: 'Obtained UID 0 root shell. Verified that coarse-grained SUID allocation creates severe escalation vectors, whereas fine-grained Linux Capabilities (`setcap`) mitigate this risk.',
      },
      lessonsLearned: {
        ar: 'المراجعة الدورية لبتات SUID باستخدام أدوات مثل \`auditd\`، وعدم إعطاء أذونات التنفيذ الخاصة للأدوات التي تمتلك واجهات تفاعلية.',
        en: 'Regularly audit filesystems with automated integrity checks, strip unnecessary SUID bits, and restrict execution permissions via strict sudoers rules.',
      },
      references: [
        'GTFOBins: Unix Binaries Breakout Directory',
        'Linux Man Pages: chmod(2), capabilities(7)',
      ],
      codeSnippets: [
        {
          title: 'SUID Discovery Command',
          language: 'bash',
          code: `# البحث عن جميع الملفات التي تمتلك إذن SUID
find / -type f -perm -04000 -ls 2>/dev/null`,
          explanation: {
            ar: 'أمر أساسي في استكشاف النظام يعرض كل البرامج ذات الصلاحيات المرفوعة مع فلترة رسائل حجب الصلاحيات.',
            en: 'Standard discovery pipeline enumerating all executables with the 4000 octal permission bit while redirecting stderr.',
          },
        },
        {
          title: 'Escalation Execution',
          language: 'bash',
          code: `# تنفيذ أمر الهروب من الصدفة عبر find
/usr/bin/find . -exec /bin/sh -p \\; -quit`,
          explanation: {
            ar: 'استدعاء الصدفة مع خيار -p للحفاظ على صلاحيات الـ Root الفعالة.',
            en: 'Executes a privileged shell maintaining the effective root UID via `-p`.',
          },
        },
      ],
    },
  },
  {
    id: 'lab-wireshark-packet-dissection',
    slug: 'lab-wireshark-packet-dissection',
    category: 'Networking',
    platform: 'Local GNS3 / Wireshark Lab',
    difficulty: 'beginner',
    status: 'completed',
    date: '2026-04-28',
    topics: ['Wireshark', 'Packet Analysis', 'PCAP', 'Cleartext Protocols', 'DNS Spoofing Analysis'],
    technologies: ['Wireshark', 'tcpdump', 'Scapy', 'GNS3 Virtual Lab'],
    title: {
      ar: 'معمل: تشريح حزم الشبكة والتقاط البروتوكولات غير المشفرة',
      en: 'Lab: Wireshark Packet Dissection & Cleartext Protocol Auditing',
    },
    description: {
      ar: 'التقاط وتحليل حركة مرور الشبكة في بيئة افتراضية لفهم الفارق بين بروتوكولات HTTP/FTP غير المشفرة ونظيراتها المشفرة عبر TLS.',
      en: 'Capturing and analyzing raw Ethernet frames and TCP streams to observe credential exposure in unencrypted protocols vs TLS encryption.',
    },
    writeup: {
      overview: {
        ar: 'البروتوكولات التي تنقل البيانات بنص صريح (Cleartext) مثل HTTP و FTP و Telnet تعرض كافة بيانات المصادقة والمعلومات الحساسة للاعتراض من أي طرف وسيط على الشبكة المحلية.',
        en: 'Legacy unencrypted protocols transmit authentication credentials and session payloads as plaintext. Anyone with network hub or promiscuous access can intercept full streams.',
      },
      objective: {
        ar: 'تسجيل ملف PCAP لحركة بيانات شبكة محلية، واستخراج بيانات اعتماد مرسلة عبر نموذج مصادقة Basic Auth غير مشفر، ومقارنتها بحزم HTTPS.',
        en: 'Capture and dissect a multi-protocol PCAP trace, extract credentials from HTTP Basic Auth headers, and contrast against TLS application data streams.',
      },
      environment: {
        ar: 'شبكة افتراضية على GNS3 تحتوي على محطة عمل (Client)، وموجه (Router)، وخادم ويب محلي، مع تشغيل أداة tcpdump لالتقاط الحزم.',
        en: 'GNS3 topology: Linux workstation, VyOS virtual router, and test Apache HTTP/HTTPS server running Wireshark packet capture.',
      },
      methodology: {
        ar: 'تطبيق فلاتر العرض المتقدمة في Wireshark (مثل \`http.request.method == "POST"\` و \`tcp.port == 80\`) وإعادة بناء مجرى الاتصال عبر "Follow TCP Stream".',
        en: 'Applied Wireshark display filters and TCP stream reassembly to isolate authentication sessions from background network noise.',
      },
      technicalInvestigation: {
        ar: 'أظهر تحليل الحزم أن ترويسة \`Authorization: Basic dXNlcjpwYXNzd29yZDEyMw==\` ليست مشفرة على الإطلاق، بل هي مجرد ترميز Base64 يمكن فكه في جزء من الثانية.',
        en: 'Discovered the client transmitted `Authorization: Basic [base64_string]`. Base64 is merely an encoding scheme with zero cryptographic protection, easily decoded to expose raw credentials.',
      },
      findings: {
        ar: 'تأكيد ضرورة فرض HTTPS من خلال ترويسات HSTS، والتأكد من عدم الاعتماد على أي تشفير سطحي في طبقة التطبيق دون تأمين طبقة النقل.',
        en: 'Demonstrated the absolute necessity of strict HSTS policies and deprecation of plaintext protocols in favor of TLS 1.3 encryption.',
      },
      lessonsLearned: {
        ar: 'الترميز (Encoding) ليس تشفيراً (Encryption). قراءة الحزم في Wireshark هي الأساس لفهم سلوك البرمجيات الخبيثة وتشخيص مشكلات الشبكات.',
        en: 'Encoding is not encryption. Deep packet inspection provides undeniable forensic evidence for diagnosing network anomalies and auditing security posture.',
      },
      references: [
        'Wireshark User Guide (Display Filters & TCP Dissectors)',
        'RFC 7617: The Basic HTTP Authentication Scheme',
      ],
      codeSnippets: [
        {
          title: 'Wireshark Display Filters',
          language: 'text',
          code: `# تصفية طلبات POST فقط في بروتوكول HTTP
http.request.method == "POST"

# تصفية استعلامات DNS للبحث عن أسماء نطاقات مشبوهة
dns.flags.response == 0 && dns.qry.name contains "corp"`,
          explanation: {
            ar: 'فلاتر عرض عملية لعزل الحزم المستهدفة بسرعة وسط ملايين الحزم في ملفات الـ PCAP.',
            en: 'Practical Wireshark display filters to isolate HTTP POST transactions and target DNS lookup queries.',
          },
        },
      ],
    },
  },
  {
    id: 'lab-bola-api-security',
    slug: 'lab-bola-api-security',
    category: 'Web Security',
    platform: 'OWASP Juice Shop / Local Node Lab',
    difficulty: 'intermediate',
    status: 'in_progress',
    date: '2026-03-12',
    topics: ['API Security', 'BOLA / IDOR', 'Broken Authorization', 'OWASP API Top 10', 'JWT'],
    technologies: ['Node.js', 'Express', 'JWT', 'Postman', 'Burp Suite'],
    title: {
      ar: 'معمل: كسر آليات التفويض على مستوى الكائنات (BOLA / IDOR) في واجهات الـ REST APIs',
      en: 'Lab: Broken Object-Level Authorization (BOLA/IDOR) in REST APIs',
    },
    description: {
      ar: 'استكشاف الثغرة الأكثر خطورة في واجهات الـ API (OWASP API #1) وتوضيح كيفية التحقق من ملكية المورد البرمجي في كل استدعاء.',
      en: 'Investigating the #1 risk on the OWASP API Security Top 10: accessing horizontal user objects via manipulated resource identifiers.',
    },
    writeup: {
      overview: {
        ar: 'تحدث ثغرة BOLA عندما تعتمد واجهات الـ API على معرفات الموارد القادمة من المستخدم (مثل \`/api/orders/1045\`) دون التحقق من أن المستخدم المصادق عليه يمتلك حق الوصول الفعلي لهذا المعرف بالتحديد.',
        en: 'Broken Object-Level Authorization occurs when API endpoints rely on client-supplied object identifiers without validating whether the authenticated user possesses authorization for that specific record.',
      },
      objective: {
        ar: 'تحديد نقطة نهاية غير محمية تسمح بقراءة وتعديل بيانات مستخدمين آخرين بمجرد تغيير معرف الحساب في الطلب، ثم كتابة كود وسيط (Middleware) لتصحيح الثغرة.',
        en: 'Discover an IDOR vector in an order-management endpoint, extract unauthorized customer records, and refactor the backend handler with strict policy enforcement.',
      },
      environment: {
        ar: 'تطبيق Express.js تجريبي يستخدم رموز JWT للمصادقة وقاعدة بيانات مستندات محلية.',
        en: 'Express.js backend with JWT bearer authentication and document store containing test order records.',
      },
      methodology: {
        ar: 'تسجيل الدخول بمستخدم عادي (User A)، ثم إرسال طلبات GET إلى \`/api/v1/users/{id}/invoices\` مع استبدال المعرف بمعرف (User B) ومراقبة رمز الاستجابة.',
        en: 'Authenticated as test User A and altered the path parameters to request invoices belonging to User B, observing whether authorization boundaries held.',
      },
      technicalInvestigation: {
        ar: 'قام الخادم بالتحقق من صحة توقيع الـ JWT (Authentication)، لكنه لم يتحقق من أن المعرف داخل الـ Token يطابق المعرف المطلوب في الـ URL (Authorization)، مما سمح بتسريب كامل الفواتير.',
        en: 'The API verified the token validity (Authentication) but omitted checking whether `req.user.id === requestedId` (Authorization), exposing horizontal user data.',
      },
      findings: {
        ar: 'المصادقة وحدها لا تعني التفويض. الاعتماد على معرفات يمكن تخمينها (Sequential IDs) يزيد من خطورة الثغرة مقارنة بمعرفات الـ UUID v4 مع فحص الملكية.',
        en: 'Authentication is distinct from Authorization. Using predictable numeric IDs accelerates enumeration attacks; implementing strict authorization middleware resolved the flaw.',
      },
      lessonsLearned: {
        ar: 'تضمين فحص الصلاحية في طبقة الوصول إلى البيانات (Data Access Layer) بدلاً من الاعتماد على التحقق السطحي في المسارات فقط.',
        en: 'Enforce authorization logic at the data access query layer (e.g., scoping DB queries to the authenticated session context) rather than relying on route-level checks alone.',
      },
      references: [
        'OWASP API Security Top 10 (API1:2023 - Broken Object Level Authorization)',
      ],
      codeSnippets: [
        {
          title: 'Remediation Middleware Example',
          language: 'typescript',
          code: `// كود المعالجة الآمن: التحقق من ملكية المورد
export async function getInvoice(req: Request, res: Response) {
  const { invoiceId } = req.params;
  const currentUserId = req.user.id; // مأخوذ بأمان من التوكن المفحوص

  const invoice = await db.invoices.findOne({
    _id: invoiceId,
    ownerId: currentUserId // ربط الاستعلام بمالك الجلسة دائماً
  });

  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found or access denied" });
  }

  return res.json(invoice);
}`,
          explanation: {
            ar: 'تضمين معرف المستخدم في الاستعلام نفسه يمنع جلب أي سجل لا يخص المستخدم حتى وإن خمّن المعرف.',
            en: 'Scoping the database lookup directly to the authenticated user ID ensures foreign records cannot be leaked regardless of parameter fuzzing.',
          },
        },
      ],
    },
  },
];

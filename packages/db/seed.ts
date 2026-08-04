// packages/db/seed.ts
function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

const IMAGE_BASE = "https://raw.githubusercontent.com/Madiocre/vote-images/main/";

const rawCandidates = [
  { imageSrc: "66666.jfif", name: "M. Salah", description: "لاعب كرة قدم" },
  { imageSrc: "555.jpg", name: "Tamer Hosny", description: "مطرب مصري" },
  { imageSrc: "rana23.jpeg", name: "Rana Raeis", description: "ممثلة مصرية" },
  { imageSrc: "nader.jpeg", name: "Nader Gourg", description: "مدرس علم نفس، فلسفة" },
  { imageSrc: "Mona.jpg", name: "Mona El Shazly", description: "اعلامية مصرية" },
  { imageSrc: "mh.salah.jpg", name: "Mohamed Salah", description: "مدرس اللغة العربية" },
  { imageSrc: "الدحيح.jfif", name: "Ahmed El Ghandour", description: "الدحيح :صانع محتوي" },
  { imageSrc: "شارع العلوم.jpg", name: "Abd Allāh Inān", description: "شارع العلوم: صانع محتوي" },
  { imageSrc: "حسام منصور.jpg", name: "Hossam mansour", description: "لاعب كمال اجسام" },
  { imageSrc: "الهام شاهين.jpg", name: "Elham Shahein", description: "ممثلة مصرية" },
  { imageSrc: "سامح حسين يعتبر.jfif", name: "Sameh Hussain", description: "ممثل مصري" },
  { imageSrc: "Trezeguet.jpg", name: "Mahmoud Trezeguet", description: "لاعب كرة" },
  { imageSrc: "Jowairia.jpg", name: "Jowairia", description: "بلوجر" },
  { imageSrc: "النائبة ندي ثابت.jpg", name: "Nada Thabet", description: "عضو مجلس النواب لجنة التضامن الخاصة" },
  { imageSrc: "اعب كوره طايره.jpg", name: "Yehia Mousa", description: "لاعب كوره طايره لدي نادي الاتحاد السكندري" },
  { imageSrc: "may.jpg", name: "May Abd El Aziz", description: "مغنية" },
  { imageSrc: "ahmed.jpg", name: "Ahmed Kemo", description: "منشئ محتوي عام + دعاية وإعلان" },
  { imageSrc: "Ahmed ElGendy.jpg", name: "Ahmed ElGendy", description: "بطل العاب اولومبية" },
  { imageSrc: "Sara Samir.jpg", name: "Sara Samir", description: "بطلة عالمية في رفع الأثقال" },
  { imageSrc: "marwanglitch.jpg", name: "Marwan Glitch", description: "صانع محتوى" },
  { imageSrc: "amr sh.jpg", name: "Amr Shelil", description: "صانع محتوى" },
  { imageSrc: "rabab_sala7.jpg", name: "Rabab Salah", description: "مصممة أزياء" },
  { imageSrc: "radwan.jpg", name: "Radwan samir", description: "راكب دراجة (دراج)" },
  { imageSrc: "dr y.jpg", name: "Dr.Yousef elghobashy", description: "صانع محتوى" },
  { imageSrc: "shreif.jpg", name: "Shireef elmahdy", description: "مخرج" },
  { imageSrc: "Mazen elgharabawy.jpg", name: "Mazen elgharabawy", description: "ممثل" },
  { imageSrc: "Ahmed saudi.jpg", name: "Ahmed saudi", description: "صانع محتوى" },
  { imageSrc: "Tarek Shawky.jpg", name: "Tarek Shawki", description: "وزير التربية والتعليم سابقا" },
  { imageSrc: "Mahmoud hegazy.jpg", name: "Mahmoud hegazy", description: "ممثل" },
  { imageSrc: "Badria tolba.jpg", name: "Badria tolba", description: "ممثلة" },
  { imageSrc: "لافينيا نادر.jpg", name: "Lavinia Nader", description: "ممثلة" },
  { imageSrc: "taher.jpg", name: "Taher Nasr", description: "دكتور بهيئه المواد النوويه" },
  { imageSrc: "عمر الشناوي.jpg", name: "Omar ELShenawy", description: "ممثل" },
  { imageSrc: "Tarek shawki.jpg", name: "Tarek El-Ebiary", description: "ممثل" },
  { imageSrc: "Osama Said.jpg", name: "Osama Said", description: "لاعب كمال اجسام" },
  { imageSrc: "يحيي الجزار.jpg", name: "Yahia elgazar", description: "بلوجر" },
  { imageSrc: "Magdy elcomando.jpg", name: "Magdy elcomando", description: "بلوجر" },
  { imageSrc: "Mohamed Nasser.jpeg", name: "Mohamed Nasser", description: "مدرس جغرفيا" },
  { imageSrc: "Khaled Sakr.jpg", name: "Khaled Sakr", description: "مدرس كيمياء" },
  { imageSrc: "Islam Mohamed.jpg", name: "Islam Mohamed", description: "بلوجر" },
  { imageSrc: "Hisham Abbas.jpg", name: "Hisham Abbas", description: "مطرب مصري" },
  { imageSrc: "Ahmed Karkeet.jpg", name: "Ahmed Karkeet", description: "منشيء محتوى" },
  { imageSrc: "Alkaisr.jpg", name: "Alkaisr", description: "بلوجر" },
  { imageSrc: "Mostafa Sriea.jpg", name: "Mostafa Abo Sriea", description: "ممثل مصري" },
  { imageSrc: "Islam Shater.jpg", name: "Eslam Elshater", description: "إعلامي رياضي" },
  { imageSrc: "Abdrahman Haredy.jpg", name: "Abdelrahman Haredy", description: "سباح مصري" },
  { imageSrc: "Maram Mohamed.jpg", name: "Maram Mohamed", description: "مؤثرة فى مجال الرياضات الالكترونيه" },
  { imageSrc: "Nahed Sebaay.jpg", name: "Nahed Alsbaai", description: "ممثلة مصرية" },
  { imageSrc: "Mohamed Essa.jpg", name: "Mohamed Esam Essa", description: "لاعب فنون قتالية" },
];

const electionId = "test-election";
const now = Date.now();

const statements = rawCandidates
  .map((c) => {
    const id = crypto.randomUUID();
    const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const imageUrl = encodeURI(IMAGE_BASE + c.imageSrc);
    return `INSERT INTO candidates (id, election_id, name, slug, description, image_src, created_at) VALUES ('${id}','${electionId}','${escapeSql(c.name)}','${slug}','${escapeSql(c.description)}','${imageUrl}',${now});`;
  })
  .join("\n");

console.log(statements);
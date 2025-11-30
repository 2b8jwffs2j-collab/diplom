import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding эхэллээ...");

  // Ангилалууд үүсгэх
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "knitting" },
      update: {},
      create: { name: "Нэхмэл эдлэл", slug: "knitting" },
    }),
    prisma.category.upsert({
      where: { slug: "sewing" },
      update: {},
      create: { name: "Оёдол", slug: "sewing" },
    }),
    prisma.category.upsert({
      where: { slug: "jewelry" },
      update: {},
      create: { name: "Гоёл чимэглэл", slug: "jewelry" },
    }),
    prisma.category.upsert({
      where: { slug: "pottery" },
      update: {},
      create: { name: "Вааран эдлэл", slug: "pottery" },
    }),
  ]);

  console.log("✅ Ангилалууд үүсгэсэн:", categories.length);

  // Админ үүсгэх
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@handmade.mn" },
    update: {},
    create: {
      email: "admin@handmade.mn",
      password: hashedAdminPassword,
      role: "ADMIN",
      profile: {
        create: {
          firstName: "Админ",
          lastName: "Хэрэглэгч",
          phone: "99001122",
        },
      },
    },
  });

  console.log("✅ Админ үүсгэсэн:", admin.email);

  // 3 худалдагч үүсгэх
  const hashedPassword = await bcrypt.hash("password123", 10);

  const seller1 = await prisma.user.upsert({
    where: { email: "saruul@example.mn" },
    update: {},
    create: {
      email: "saruul@example.mn",
      password: hashedPassword,
      role: "SELLER",
      profile: {
        create: {
          firstName: "Сарүүл",
          lastName: "Батаа",
          phone: "99112233",
          bio: "Гэрээсээ нэхмэл эдлэл хийдэг. 10 жилийн туршлагатай.",
        },
      },
      wallet: {
        create: { balance: 0n },
      },
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: "oyunaa@example.mn" },
    update: {},
    create: {
      email: "oyunaa@example.mn",
      password: hashedPassword,
      role: "SELLER",
      profile: {
        create: {
          firstName: "Оюунаа",
          lastName: "Ганбаатар",
          phone: "99223344",
          bio: "Оёдол, хувцасны загвар хийдэг.",
        },
      },
      wallet: {
        create: { balance: 0n },
      },
    },
  });

  const seller3 = await prisma.user.upsert({
    where: { email: "boldoo@example.mn" },
    update: {},
    create: {
      email: "boldoo@example.mn",
      password: hashedPassword,
      role: "SELLER",
      profile: {
        create: {
          firstName: "Болдоо",
          lastName: "Энхбат",
          phone: "99334455",
          bio: "Гоёл чимэглэл, хүлэг зүүлт хийдэг.",
        },
      },
      wallet: {
        create: { balance: 0n },
      },
    },
  });

  console.log("✅ Худалдагчид үүсгэсэн: 3");

  // Худалдан авагч үүсгэх (wallet-тай)
  const buyer = await prisma.user.upsert({
    where: { email: "buyer@example.mn" },
    update: {},
    create: {
      email: "buyer@example.mn",
      password: hashedPassword,
      role: "BUYER",
      profile: {
        create: {
          firstName: "Батаа",
          lastName: "Доржийн",
          phone: "99445566",
          address: "Улаанбаатар, СБД, 1-р хороо",
        },
      },
      wallet: {
        create: { balance: 50000000n }, // 500,000₮ (500,000 * 100)
      },
    },
  });

  console.log("✅ Худалдан авагч үүсгэсэн:", buyer.email);

  // 8 бүтээгдэхүүн үүсгэх
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sellerId: seller1.id,
        categoryId: categories[0].id, // Нэхмэл эдлэл
        name: "Ноосон малгай",
        description: "Гараар нэхсэн дулаан малгай. Монгол ноосоор хийсэн.",
        price: 2500000n, // 25,000₮
        stock: 5,
        imageUrls: JSON.stringify([
          "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9",
        ]),
        status: "APPROVED",
        materials: "Монгол ноос, утас",
        timeToMake: "2 өдөр",
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller1.id,
        categoryId: categories[0].id,
        name: "Нэхмэл бээлий",
        description: "Өвлийн дулаан бээлий, өвс өнгөтэй.",
        price: 1800000n, // 18,000₮
        stock: 10,
        imageUrls: JSON.stringify([
          "https://images.unsplash.com/photo-1606937933838-d260a8d2d2e5",
        ]),
        status: "APPROVED",
        materials: "Утас, ноос",
        timeToMake: "1 өдөр",
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller2.id,
        categoryId: categories[1].id, // Оёдол
        name: "Гараар оёсон уут",
        description: "Монгол хээтэй уут. Гоёмсог загвартай.",
        price: 3500000n, // 35,000₮
        stock: 3,
        imageUrls: JSON.stringify([
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7",
        ]),
        status: "APPROVED",
        materials: "Даавуу, утас",
        timeToMake: "3 өдөр",
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller2.id,
        categoryId: categories[1].id,
        name: "Даавуун цүнх",
        description:
          "Эко найрсаг даавуун цүнх. Өдөр тутмын хэрэглээнд тохиромжтой.",
        price: 2000000n, // 20,000₮
        stock: 8,
        imageUrls: JSON.stringify([
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2",
        ]),
        status: "APPROVED",
        materials: "Даавуу",
        timeToMake: "2 цаг",
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller3.id,
        categoryId: categories[2].id, // Гоёл чимэглэл
        name: "Гар хийц зүүлт",
        description: "Модон бөмбөлөгтэй, өнгөлөг зүүлт.",
        price: 1200000n, // 12,000₮
        stock: 15,
        imageUrls: JSON.stringify([
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908",
        ]),
        status: "APPROVED",
        materials: "Мод, утас",
        timeToMake: "1 цаг",
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller3.id,
        categoryId: categories[2].id,
        name: "Хүлэг зүүлт",
        description: "Түрэмгий чулуутай хүлэг зүүлт.",
        price: 2800000n, // 28,000₮
        stock: 7,
        imageUrls: JSON.stringify([
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
        ]),
        status: "APPROVED",
        materials: "Түрэмгий чулуу, мөнгөн холбоос",
        timeToMake: "4 цаг",
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller3.id,
        categoryId: categories[2].id,
        name: "Гар хийц хүзүүний зүүлт",
        description: "Өнгөлөг бөмбөлөгүүдтэй, гоёмсог хүзүүний зүүлт.",
        price: 1500000n, // 15,000₮
        stock: 12,
        imageUrls: JSON.stringify([
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f",
        ]),
        status: "APPROVED",
        materials: "Шил, утас",
        timeToMake: "2 цаг",
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller1.id,
        categoryId: categories[0].id,
        name: "Нэхмэл ноосон шал",
        description: "Том хэмжээтэй дулаан шал. Гэрийн орчинд тохиромжтой.",
        price: 8500000n, // 85,000₮
        stock: 2,
        imageUrls: JSON.stringify([
          "https://images.unsplash.com/photo-1597778342680-59d98d47d7e8",
        ]),
        status: "APPROVED",
        materials: "Монгол ноос, утас",
        timeToMake: "1 долоо хоног",
      },
    }),
  ]);

  console.log("✅ Бүтээгдэхүүнүүд үүсгэсэн:", products.length);

  // Buyer-ийн wallet-д top-up transaction үүсгэх
  const buyerWallet = await prisma.wallet.findUnique({
    where: { userId: buyer.id },
  });

  if (buyerWallet) {
    await prisma.walletTransaction.create({
      data: {
        walletId: buyerWallet.id,
        amount: 50000000n, // 500,000₮
        type: "TOP_UP",
        description: "Анхны цэнэглэлт (seed)",
      },
    });
    console.log("✅ Buyer-ийн wallet transaction үүсгэсэн");
  }

  console.log("🎉 Seeding амжилттай дууслаа!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding алдаа:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

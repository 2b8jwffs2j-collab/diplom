import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding эхэллээ...');

  // Ангилалууд үүсгэх
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'knitting-sewing' },
      update: {},
      create: { name: 'Нэхмэл & Оёмол', slug: 'knitting-sewing' },
    }),
    prisma.category.upsert({
      where: { slug: 'wooden-crafts' },
      update: {},
      create: { name: 'Модон урлал', slug: 'wooden-crafts' },
    }),
    prisma.category.upsert({
      where: { slug: 'eco-crafts' },
      update: {},
      create: { name: 'Эко урлал', slug: 'eco-crafts' },
    }),
    prisma.category.upsert({
      where: { slug: 'jewelry' },
      update: {},
      create: { name: 'Гоёл чимэглэл', slug: 'jewelry' },
    }),
    prisma.category.upsert({
      where: { slug: 'art-painting' },
      update: {},
      create: { name: 'Уран зураг', slug: 'art-painting' },
    }),
    prisma.category.upsert({
      where: { slug: 'home-decor' },
      update: {},
      create: { name: 'Гэр ахуйн декор', slug: 'home-decor' },
    }),
    prisma.category.upsert({
      where: { slug: 'toys-gifts' },
      update: {},
      create: { name: 'Тоглоом & Бэлэг', slug: 'toys-gifts' },
    }),
    prisma.category.upsert({
      where: { slug: 'clothing-accessories' },
      update: {},
      create: { name: 'Хувцас & Аксесуар', slug: 'clothing-accessories' },
    }),
    prisma.category.upsert({
      where: { slug: 'gift-box' },
      update: {},
      create: { name: 'Gift Box', slug: 'gift-box' },
    }),
    prisma.category.upsert({
      where: { slug: 'leather-goods' },
      update: {},
      create: { name: 'Арьсан эдлэл', slug: 'leather-goods' },
    }),
  ]);

  console.log('✅ Ангилалууд үүсгэсэн:', categories.length);

  // Админ үүсгэх
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@handmade.mn' },
    update: {},
    create: {
      email: 'admin@handmade.mn',
      password: hashedAdminPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Админ',
          lastName: 'Хэрэглэгч',
          phone: '99001122',
        },
      },
    },
  });

  console.log('✅ Админ үүсгэсэн:', admin.email);

  // 3 худалдагч үүсгэх
  const hashedPassword = await bcrypt.hash('password123', 10);

  const seller1 = await prisma.user.upsert({
    where: { email: 'saruul@example.mn' },
    update: {},
    create: {
      email: 'saruul@example.mn',
      password: hashedPassword,
      role: 'SELLER',
      profile: {
        create: {
          firstName: 'Сарүүл',
          lastName: 'Батаа',
          phone: '99112233',
          bio: 'Гэрээсээ нэхмэл эдлэл хийдэг. 10 жилийн туршлагатай.',
        },
      },
      wallet: {
        create: { balance: 0n },
      },
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: 'oyunaa@example.mn' },
    update: {},
    create: {
      email: 'oyunaa@example.mn',
      password: hashedPassword,
      role: 'SELLER',
      profile: {
        create: {
          firstName: 'Оюунаа',
          lastName: 'Ганбаатар',
          phone: '99223344',
          bio: 'Оёдол, хувцасны загвар хийдэг.',
        },
      },
      wallet: {
        create: { balance: 0n },
      },
    },
  });

  const seller3 = await prisma.user.upsert({
    where: { email: 'boldoo@example.mn' },
    update: {},
    create: {
      email: 'boldoo@example.mn',
      password: hashedPassword,
      role: 'SELLER',
      profile: {
        create: {
          firstName: 'Болдоо',
          lastName: 'Энхбат',
          phone: '99334455',
          bio: 'Гоёл чимэглэл, хүлэг зүүлт хийдэг.',
        },
      },
      wallet: {
        create: { balance: 0n },
      },
    },
  });

  console.log('✅ Худалдагчид үүсгэсэн: 3');

  // Худалдан авагч үүсгэх (wallet-тай)
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@example.mn' },
    update: {},
    create: {
      email: 'buyer@example.mn',
      password: hashedPassword,
      role: 'BUYER',
      profile: {
        create: {
          firstName: 'Батаа',
          lastName: 'Доржийн',
          phone: '99445566',
          address: 'Улаанбаатар, СБД, 1-р хороо',
        },
      },
      wallet: {
        create: { balance: 50000000n }, // 500,000₮ (500,000 * 100)
      },
    },
  });

  console.log('✅ Худалдан авагч үүсгэсэн:', buyer.email);

  // Бүтээгдэхүүнүүд үүсгэх
  const products = await Promise.all([
    // Нэхмэл & Оёмол
    prisma.product.create({
      data: {
        sellerId: seller1.id,
        categoryId: categories[0].id, // Нэхмэл & Оёмол
        name: 'Ноосон малгай',
        description: 'Гараар нэхсэн дулаан малгай. Монгол ноосоор хийсэн.',
        price: 2500000n, // 25,000₮
        originalPrice: 3000000n, // 30,000₮
        discount: 17,
        stock: 5,
        imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9']),
        status: 'APPROVED',
        materials: 'Монгол ноос, утас',
        timeToMake: '2 өдөр',
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller1.id,
        categoryId: categories[0].id,
        name: 'Ноосон оймс',
        description: 'Гараар нэхсэн дулаан оймс. Хөлдөө дулаахан байх болно.',
        price: 1500000n, // 15,000₮
        stock: 10,
        imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9']),
        status: 'APPROVED',
        materials: 'Монгол ноос',
        timeToMake: '1 өдөр',
      },
    }),
    // Модон урлал
    prisma.product.create({
      data: {
        sellerId: seller2.id,
        categoryId: categories[1].id, // Модон урлал
        name: 'Модон таваг',
        description: 'Гараар хийсэн модон таваг. Байгальд ээлтэй.',
        price: 1800000n, // 18,000₮
        originalPrice: 2200000n, // 22,000₮
        discount: 18,
        stock: 8,
        imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1590874103328-eac38a683ce7']),
        status: 'APPROVED',
        materials: 'Мод',
        timeToMake: '3 өдөр',
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller2.id,
        categoryId: categories[1].id,
        name: 'Модон хайрцаг',
        description: 'Гоёмсог модон хайрцаг. Бэлэг хадгалахад тохиромжтой.',
        price: 3500000n, // 35,000₮
        stock: 5,
        imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1543163521-1bf539c55dd2']),
        status: 'APPROVED',
        materials: 'Мод, гантиг',
        timeToMake: '5 өдөр',
      },
    }),
    // Эко урлал
    prisma.product.create({
      data: {
        sellerId: seller2.id,
        categoryId: categories[2].id, // Эко урлал
        name: 'Эко цүнх',
        description: 'Эко найрсаг даавуун цүнх. Өдөр тутмын хэрэглээнд тохиромжтой.',
        price: 2000000n, // 20,000₮
        originalPrice: 2500000n, // 25,000₮
        discount: 20,
        stock: 8,
        imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1543163521-1bf539c55dd2']),
        status: 'APPROVED',
        materials: 'Эко даавуу',
        timeToMake: '2 цаг',
      },
    }),
    // Гоёл чимэглэл
    prisma.product.create({
      data: {
        sellerId: seller3.id,
        categoryId: categories[3].id, // Гоёл чимэглэл
        name: 'Гар хийц зүүлт',
        description: 'Модон бөмбөлөгтэй, өнгөлөг зүүлт.',
        price: 1200000n, // 12,000₮
        stock: 15,
        imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908']),
        status: 'APPROVED',
        materials: 'Мод, утас',
        timeToMake: '1 цаг',
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller3.id,
        categoryId: categories[3].id,
        name: 'Хүлэг зүүлт',
        description: 'Түрэмгий чулуутай хүлэг зүүлт.',
        price: 2800000n, // 28,000₮
        originalPrice: 3500000n, // 35,000₮
        discount: 20,
        stock: 7,
        imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1611591437281-460bfbe1220a']),
        status: 'APPROVED',
        materials: 'Түрэмгий чулуу, мөнгөн холбоос',
        timeToMake: '4 цаг',
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller3.id,
        categoryId: categories[3].id,
        name: 'Гар хийц хүзүүний зүүлт',
        description: 'Өнгөлөг бөмбөлөгүүдтэй, гоёмсог хүзүүний зүүлт.',
        price: 1500000n, // 15,000₮
        stock: 12,
        imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f']),
        status: 'APPROVED',
        materials: 'Шил, утас',
        timeToMake: '2 цаг',
      },
    }),
    // Уран зураг
    prisma.product.create({
      data: {
        sellerId: seller1.id,
        categoryId: categories[4].id, // Уран зураг
        name: 'Монгол хээтэй зураг',
        description: 'Гараар будсан монгол хээтэй зураг. Гэрийн чимэглэлд тохиромжтой.',
        price: 5000000n, // 50,000₮
        stock: 3,
        imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1541961017774-22349e4a1262']),
        status: 'APPROVED',
        materials: 'Хуудас, будгийн материал',
        timeToMake: '7 өдөр',
      },
    }),
    // Гэр ахуйн декор
    prisma.product.create({
      data: {
        sellerId: seller2.id,
        categoryId: categories[5].id, // Гэр ахуйн декор
        name: 'Ноосон хавтас',
        description: 'Гараар нэхсэн ноосон хавтас. Гэрийн чимэглэлд тохиромжтой.',
        price: 3000000n, // 30,000₮
        originalPrice: 3800000n, // 38,000₮
        discount: 21,
        stock: 6,
        imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7']),
        status: 'APPROVED',
        materials: 'Ноос, утас',
        timeToMake: '4 өдөр',
      },
    }),
    // Тоглоом & Бэлэг
    prisma.product.create({
      data: {
        sellerId: seller1.id,
        categoryId: categories[6].id, // Тоглоом & Бэлэг
        name: 'Ноосон хүүхэлдэй',
        description: 'Гараар нэхсэн ноосон хүүхэлдэй. Хүүхдүүдэд зориулсан.',
        price: 2200000n, // 22,000₮
        stock: 10,
        imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64']),
        status: 'APPROVED',
        materials: 'Ноос, утас',
        timeToMake: '3 өдөр',
      },
    }),
    // Хувцас & Аксесуар
    prisma.product.create({
      data: {
        sellerId: seller2.id,
        categoryId: categories[7].id, // Хувцас & Аксесуар
        name: 'Гараар оёсон уут',
        description: 'Монгол хээтэй уут. Гоёмсог загвартай.',
        price: 3500000n, // 35,000₮
        originalPrice: 4000000n, // 40,000₮
        discount: 13,
        stock: 3,
        imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1590874103328-eac38a683ce7']),
        status: 'APPROVED',
        materials: 'Даавуу, утас',
        timeToMake: '3 өдөр',
      },
    }),
    // Арьсан эдлэл
    prisma.product.create({
      data: {
        sellerId: seller3.id,
        categoryId: categories[9].id, // Арьсан эдлэл
        name: 'Арьсан цүнх',
        description: 'Гараар хийсэн арьсан цүнх. Удаан эдэлгээтэй.',
        price: 4500000n, // 45,000₮
        originalPrice: 5500000n, // 55,000₮
        discount: 18,
        stock: 4,
        imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1553062407-98eeb64c6a62']),
        status: 'APPROVED',
        materials: 'Арьс, утас',
        timeToMake: '5 өдөр',
      },
    }),
  ]);

  console.log('✅ Бүтээгдэхүүнүүд үүсгэсэн:', products.length);

  // Buyer-ийн wallet-д top-up transaction үүсгэх
  const buyerWallet = await prisma.wallet.findUnique({
    where: { userId: buyer.id },
  });

  if (buyerWallet) {
    await prisma.walletTransaction.create({
      data: {
        walletId: buyerWallet.id,
        amount: 50000000n, // 500,000₮
        type: 'TOP_UP',
        description: 'Анхны цэнэглэлт (seed)',
      },
    });
    console.log('✅ Buyer-ийн wallet transaction үүсгэсэн');
  }

  console.log('🎉 Seeding амжилттай дууслаа!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding алдаа:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

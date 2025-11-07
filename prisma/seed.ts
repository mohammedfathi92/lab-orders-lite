import { PrismaClient, Gender } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.orderTest.deleteMany();
  await prisma.order.deleteMany();
  await prisma.test.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // Seed Demo User
  console.log('👤 Creating demo user...');
  const hashedPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
      role: 'USER',
    },
  });
  console.log(`✅ Created demo user: ${demoUser.email}`);

  // Seed Patients
  console.log('👥 Creating patients...');
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        name: 'John Doe',
        dob: new Date('1985-06-10'),
        gender: Gender.MALE,
        phone: '+1-555-0101',
        address: '123 Main St, New York, NY 10001',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Sarah Smith',
        dob: new Date('1990-12-22'),
        gender: Gender.FEMALE,
        phone: '+1-555-0102',
        address: '456 Oak Ave, Los Angeles, CA 90001',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Omar Khaled',
        dob: new Date('1978-09-15'),
        gender: Gender.MALE,
        phone: '+1-555-0103',
        address: '789 Pine Rd, Chicago, IL 60601',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Lina Faris',
        dob: new Date('2000-03-05'),
        gender: Gender.FEMALE,
        phone: '+1-555-0104',
        address: '321 Elm St, Houston, TX 77001',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Ahmed Mansour',
        dob: new Date('1989-01-11'),
        gender: Gender.MALE,
        phone: '+1-555-0105',
        address: '654 Maple Dr, Phoenix, AZ 85001',
      },
    }),
  ]);

  console.log(`✅ Created ${patients.length} patients`);

  // Seed Tests
  console.log('🧪 Creating tests...');
  const tests = await Promise.all([
    prisma.test.create({
      data: {
        code: 'CBC',
        name: 'CBC (Complete Blood Count)',
        price: 100.0,
        turnaroundDays: 1,
        isAvailable: true,
      },
    }),
    prisma.test.create({
      data: {
        code: 'LFT',
        name: 'Liver Function Test',
        price: 250.0,
        turnaroundDays: 2,
        isAvailable: true,
      },
    }),
    prisma.test.create({
      data: {
        code: 'KFT',
        name: 'Kidney Function Test',
        price: 200.0,
        turnaroundDays: 2,
        isAvailable: true,
      },
    }),
    prisma.test.create({
      data: {
        code: 'BS',
        name: 'Blood Sugar',
        price: 80.0,
        turnaroundDays: 0,
        isAvailable: true,
      },
    }),
    prisma.test.create({
      data: {
        code: 'VITD',
        name: 'Vitamin D',
        price: 300.0,
        turnaroundDays: 3,
        isAvailable: true,
      },
    }),
  ]);

  console.log(`✅ Created ${tests.length} tests`);

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

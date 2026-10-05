import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";

loadEnvConfig(process.cwd());

import { hashPassword } from "@/lib/auth/password";
import { User } from "@/server/models/User";
import { Customer } from "@/server/models/Customer";
import { StaffProfile } from "@/server/models/StaffProfile";

async function seedUsers() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(uri);

  console.log("Connected to MongoDB.");

  const adminEmail = "admin@cleanin.ng";
  const staffEmail = "staff@cleanin.ng";
  const customerEmail = "customer@cleanin.ng";

  const adminPassword = "Admin123!";
  const staffPassword = "Staff123!";
  const customerPassword = "Customer123!";

  /*
   * ADMIN
   */
  const adminHash = await hashPassword(adminPassword);

  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      email: adminEmail,
      passwordHash: adminHash,
      role: "admin",
      active: true,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  /*
   * STAFF PROFILE
   */
  let staffProfile = await StaffProfile.findOne({
    email: staffEmail,
  });

  if (!staffProfile) {
    staffProfile = await StaffProfile.create({
      firstName: "Cleanin",
      lastName: "Staff",
      email: staffEmail,
      phone: "08000000000",
      role: "Inspector",
      availability: "available",
      active: true,
      rating: 0,
    });
  } else {
    await StaffProfile.updateOne(
      { _id: staffProfile._id },
      {
        $set: {
          role: "Inspector",
          availability: "available",
          active: true,
        },
      },
    );
  }

  /*
   * STAFF USER
   */
  const staffHash = await hashPassword(staffPassword);

  const staff = await User.findOneAndUpdate(
    { email: staffEmail },
    {
      email: staffEmail,
      passwordHash: staffHash,
      role: "staff",
      active: true,
      staffProfileId: staffProfile._id,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  await StaffProfile.updateOne(
    { _id: staffProfile._id },
    {
      $set: {
        userId: staff._id,
      },
    },
  );

  /*
   * CUSTOMER PROFILE
   */
  let customer = await Customer.findOne({
    email: customerEmail,
  });

  if (!customer) {
    customer = await Customer.create({
      firstName: "Cleanin",
      lastName: "Customer",
      email: customerEmail,
      phone: "08100000000",
      hasAccount: true,
      status: "active",
    });
  } else {
    await Customer.updateOne(
      { _id: customer._id },
      {
        $set: {
          hasAccount: true,
          status: "active",
        },
      },
    );
  }

  /*
   * CUSTOMER USER
   */
  const customerHash = await hashPassword(customerPassword);

  const customerUser = await User.findOneAndUpdate(
    { email: customerEmail },
    {
      email: customerEmail,
      passwordHash: customerHash,
      role: "customer",
      active: true,
      customerId: customer._id,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  await Customer.updateOne(
    { _id: customer._id },
    {
      $set: {
        userId: customerUser._id,
        hasAccount: true,
      },
    },
  );

  console.log("");
  console.log("Authentication seed completed successfully.");
  console.log("");

  console.log("Admin:");
  console.log(`  ${adminEmail} / ${adminPassword}`);
  console.log("");

  console.log("Staff:");
  console.log(`  ${staffEmail} / ${staffPassword}`);
  console.log("");

  console.log("Customer:");
  console.log(`  ${customerEmail} / ${customerPassword}`);
  console.log("");

  /*
   * SOMI STAFF USER
   */
  const somiEmail = "somi@gmail.com";
  const somiPassword = "Somi123!";

  const somiProfile = await StaffProfile.findOne({
    email: somiEmail,
  });

  if (!somiProfile) {
    throw new Error(`Staff profile not found for ${somiEmail}`);
  }

  const somiHash = await hashPassword(somiPassword);

  const somiUser = await User.findOneAndUpdate(
    { email: somiEmail },
    {
      email: somiEmail,
      passwordHash: somiHash,
      role: "staff",
      active: true,
      staffProfileId: somiProfile._id,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  await StaffProfile.updateOne(
    { _id: somiProfile._id },
    {
      $set: {
        userId: somiUser._id,
        active: true,
      },
    },
  );

  console.log("Somi staff account:");
  console.log(`  ${somiEmail} / ${somiPassword}`);
}

seedUsers()
  .catch((error) => {
    console.error("Authentication seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

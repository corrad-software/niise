import sha256 from "crypto-js/sha256.js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userID } = event.context.user;

  try {
    // First get the current user
    const user = await prisma.user.findUnique({
      where: {
        userID: userID,
      },
    });

    if (!user) {
      return {
        statusCode: 404,
        message: "Pengguna tidak dijumpai",
      };
    }

    // Verify old password
    const hashedOldPassword = sha256(body.oldPassword).toString();
    if (user.userPassword !== hashedOldPassword) {
      return {
        statusCode: 400,
        message: "Kata laluan semasa tidak tepat",
      };
    }

    // Hash new password
    const hashedNewPassword = sha256(body.newPassword).toString();

    // Update password
    await prisma.user.update({
      where: {
        userID: userID,
      },
      data: {
        userPassword: hashedNewPassword,
        userModifiedDate: new Date(),
      },
    });

    return {
      statusCode: 200,
      message: "Kata laluan berjaya dikemaskini",
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      statusCode: 500,
      message: "Ralat semasa mengemaskini kata laluan",
    };
  }
});

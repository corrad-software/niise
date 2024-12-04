export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userID } = event.context.user;

  try {
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        userID: userID,
      },
      data: {
        userFullName: body.userFullName,
        userEmail: body.userEmail,
        userPhone: body.userPhone,
        userRank: body.userRank,
        userOfficerNumber: body.userOfficerNumber,
        userModifiedDate: new Date(),
      },
    });

    return {
      statusCode: 200,
      message: "Profil berjaya dikemaskini",
      data: {
        name: updatedUser.userFullName,
        email: updatedUser.userEmail,
        phone: updatedUser.userPhone,
        rank: updatedUser.userRank,
        officerNumber: updatedUser.userOfficerNumber,
      },
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      statusCode: 500,
      message: "Ralat semasa mengemaskini profil",
    };
  }
});

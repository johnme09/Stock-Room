export const serializeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  about: user.about,
  favorites: user.favorites?.map((fav) =>
    typeof fav === "object" ? fav.toString() : fav
  ),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});


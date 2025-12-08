export const serializeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  image: user.image || '',
  about: user.about,
  favorites: user.favorites?.map((fav) =>
    typeof fav === "object" ? fav.toString() : fav
  ),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});


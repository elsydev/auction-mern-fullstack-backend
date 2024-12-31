const generarId = () => {
  const random = Math.floor(100000 + Math.random() * 900000).toString();

  return random;
};
export default generarId;

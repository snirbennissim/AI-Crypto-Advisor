const cryptoMemes = [
  {
    id: "meme1",
    url: "https://i.imgur.com/KrctgtH.jpeg",
    caption: "Crypto holder",
  },
  {
    id: "meme2",
    url: "https://web3.career/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBeVJOQWc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--6b7470babffc39c8ae519b40f572e2fd4c3ed6a2/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lKYW5CbFp3WTZCa1ZVT2hSeVpYTnBlbVZmZEc5ZmJHbHRhWFJiQjJrQ0FBUnBBZ0FEIiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--bc95f1a645ed62d5320c353527cf266f294f1a71/remember%20all%20of%20that%20money%20we%20saved%20for%20the%20house.jpeg",
    caption: "Surprise for a wife",
  },
  {
    id: "meme3",
    url: "https://web3.career/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBelZMQWc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--3196ecb4f0aab7940872d67c96fff786d17fa261/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNIYVFJQUJHa0NBQU09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--7512606fd1fa5b2ea27d1bd4c5f8aea3534c6eef/should%20I%20sell%20bitcoin.png",
    caption: "Bitcoin in orange",
  },
];

export function getRandomMeme() {
  const randomIndex = Math.floor(Math.random() * cryptoMemes.length);
  return cryptoMemes[randomIndex];
}

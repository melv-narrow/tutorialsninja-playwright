export type TestUser = {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
};

export const createTestUser = (): TestUser => {
  const uniqueSegment = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

  return {
    firstName: 'Codex',
    lastName: 'Portfolio',
    email: `codex.${uniqueSegment}@example.com`,
    telephone: `07${uniqueSegment.slice(-8)}`,
    password: 'Password123!',
  };
};

const { z } = require("zod");
const { createNonce, verifySiweMessage, verifyToken, createToken } = require("../services/auth.service");
const { state } = require("../data/store");

const nonceQuerySchema = z.object({
  address: z.string().min(8),
  role: z.string().min(2)
});

const verifySchema = z.object({
  message: z.string().min(20),
  signature: z.string().min(10)
});

const nonce = (req, res) => {
  const parseResult = nonceQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const nonceValue = createNonce(parseResult.data.address, parseResult.data.role);

  return res.json({
    nonce: nonceValue,
    address: parseResult.data.address,
    role: parseResult.data.role
  });
};

const verify = async (req, res) => {
  const parseResult = verifySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  try {
    const result = await verifySiweMessage(parseResult.data);
    return res.json(result);
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

const me = (req, res) => {
  try {
    const session = verifyToken(req.headers.authorization);
    return res.json({ session });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

const demo = (req, res) => {
  try {
    const { role = "MSME" } = req.query;
    const user = state.users.find((item) => item.role === role && item.demoAccount);
    if (!user) {
      return res.status(404).json({ error: "Demo account not found" });
    }
    const token = createToken(user.address, user.role);
    return res.json({
      token,
      session: {
        id: user.id,
        email: user.email,
        address: user.address,
        role: user.role,
        chainId: 31337,
        domain: "localhost:3001"
      }
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  nonce,
  verify,
  me,
  demo
};

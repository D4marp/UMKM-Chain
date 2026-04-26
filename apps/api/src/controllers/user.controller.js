const { z } = require("zod");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { createToken } = require("../services/auth.service");
const { state } = require("../data/store");

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["MSME", "LENDER", "REGULATOR"])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const register = async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    const { email, password, role } = parseResult.data;

    // Check if user already exists
    const existingUser = state.users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: "Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate mock wallet address
    const mockAddress = `0x${crypto.randomBytes(20).toString("hex")}`;

    // Create user
    const newUser = {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      role,
      address: mockAddress,
      createdAt: new Date().toISOString()
    };

    state.users.push(newUser);

    // Generate token
    const token = createToken(mockAddress, role);

    return res.status(201).json({
      message: "Registrasi berhasil",
      token,
      session: {
        id: newUser.id,
        email: newUser.email,
        address: mockAddress,
        role,
        chainId: 31337,
        domain: "localhost:3001"
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    const { email, password } = parseResult.data;

    // Find user
    const user = state.users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    // Generate token
    const token = createToken(user.address, user.role);

    return res.json({
      message: "Login berhasil",
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
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login
};

import { z } from "zod";

export const registerSchema = z.object({
  userName: z.string({
    required_error: "El nombre de usuario es requerido",
  }),
  email: z
    .string({
      required_error: "El email es requerido",
    })
    .email({
      message: "El email no es valido",
    }),
  password: z
    .string({
      required_error: "La contraseña es requerida",
    })
    .min(8, {
      message: "La contraseña debe tener al menos 8 caracteres",
    }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

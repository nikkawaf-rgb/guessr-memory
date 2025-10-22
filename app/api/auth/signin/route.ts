import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, password, isRegister } = body;

    if (!name || !password) {
      return NextResponse.json(
        { error: "Имя и пароль обязательны" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedPassword = password.trim();

    if (isRegister) {
      // Регистрация нового пользователя
      const existingUser = await prisma.user.findUnique({
        where: { name: trimmedName },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Пользователь с таким именем уже существует" },
          { status: 400 }
        );
      }

      const user = await prisma.user.create({
        data: {
          name: trimmedName,
          password: trimmedPassword,
          role: "player",
        },
      });

      console.log(`[AUTH] New user registered: ${trimmedName}`);

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
        },
      });
    } else {
      // Вход существующего пользователя
      const user = await prisma.user.findUnique({
        where: { name: trimmedName },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Пользователь не найден. Создайте новый аккаунт." },
          { status: 404 }
        );
      }

      if (user.password !== trimmedPassword) {
        return NextResponse.json(
          { error: "Неверный пароль" },
          { status: 401 }
        );
      }

      console.log(`[AUTH] User logged in: ${trimmedName}`);

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
        },
      });
    }
  } catch (error) {
    console.error("Error in signin:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}


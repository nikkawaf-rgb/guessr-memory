import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth";
import { moderateComment } from "./actions";
import ModerationDashboard from "./_components/ModerationDashboard";

export default async function ModerationPage() {
  await requireAdmin();

  const reports = await prisma.report.findMany({
    where: { resolved: false },
    include: {
      comment: {
        include: {
          photo: true,
          user: true,
        },
      },
      reporter: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const resolvedReports = await prisma.report.findMany({
    where: { resolved: true },
    include: {
      comment: {
        include: {
          photo: true,
          user: true,
        },
      },
      reporter: true,
    },
    orderBy: { resolvedAt: "desc" },
    take: 20,
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Модерация репортов</h1>

      <ModerationDashboard />

      {/* Active Reports */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Активные репорты ({reports.length})</h2>
        {reports.length === 0 ? (
          <p className="text-gray-500">Нет активных репортов</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white border border-red-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm text-gray-500">
                      Репорт от {report.reporter.name || "Гость"} • {new Date(report.createdAt).toLocaleString("ru-RU")}
                    </div>
                    {report.reason && (
                      <div className="text-sm text-gray-700 mt-1">
                        <strong>Причина:</strong> {report.reason}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <form action={moderateComment}>
                      <input type="hidden" name="commentId" value={report.comment.id} />
                      <input type="hidden" name="action" value="hide" />
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                        Скрыть
                      </button>
                    </form>
                    <form action={moderateComment}>
                      <input type="hidden" name="commentId" value={report.comment.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                        Одобрить
                      </button>
                    </form>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600 mb-2">
                    Комментарий от {report.comment.user.name || "Гость"}:
                  </div>
                  <div className="text-gray-800">{report.comment.content}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    К фото: {report.comment.photo.storagePath}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Reports */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Недавно решенные репорты</h2>
        {resolvedReports.length === 0 ? (
          <p className="text-gray-500">Нет решенных репортов</p>
        ) : (
          <div className="space-y-3">
            {resolvedReports.map((report) => (
              <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">{report.comment.user.name || "Гость"}</span>
                    <span className="text-gray-500"> • </span>
                    <span className="text-gray-500">
                      {report.resolvedAt ? new Date(report.resolvedAt).toLocaleString("ru-RU") : ""}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded ${
                      report.resolution === "hidden" 
                        ? "bg-red-100 text-red-700" 
                        : "bg-green-100 text-green-700"
                    }`}>
                      {report.resolution === "hidden" ? "Скрыт" : "Одобрен"}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-1 truncate">
                  {report.comment.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

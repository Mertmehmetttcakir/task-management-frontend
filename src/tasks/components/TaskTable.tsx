import React from "react";
import { TaskDto } from "../../services/TaskService";
import { statusClass, statusLabel } from "../status";

export interface TaskTableProps {
  tasks: TaskDto[];
  saving?: boolean;
  currentUserId?: number | null;
  currentDepartment?: number | null;
  onDetail(task: TaskDto): void;
  onEdit(task: TaskDto): void;
  onDelete(task: TaskDto): void;
  onApprove(task: TaskDto): void;
  onReject(task: TaskDto): void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  saving,
  currentUserId,
  currentDepartment,
  onDetail,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) => {
  if (tasks.length === 0) return <div style={{ padding: 12 }}>Görev bulunamadı.</div>;
  return (
    <table className="table">
      <thead>
        <tr>
          <th style={{ width: 80 }}>ID</th>
          <th>Başlık</th>
          <th>Açıklama</th>
          <th style={{ width: 160 }}>Durum</th>
          <th style={{ width: 160 }}>Departman</th>
          <th style={{ width: 180 }}>Oluşturan</th>
          <th className="col-actions">İşlemler</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((t) => {
          const isOwner = currentUserId === t.user?.id;
          const canActOnDept = currentDepartment != null && currentDepartment === t.assignedDepartment;
          const isPending = t.status === 0;
          return (
            <tr key={t.id}>
              <td>#{t.id}</td>
              <td>{t.title}</td>
              <td style={{ maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</td>
              <td>
                <span className={statusClass(t.status).pill}>
                  <span className={statusClass(t.status).dot} />
                  {statusLabel(t.status)}
                </span>
              </td>
              <td>{t.assignedDepartment}</td>
              <td>{t.user?.name}</td>
              <td className="col-actions">
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn" onClick={() => onDetail(t)}>Detay</button>
                  {isOwner && (
                    <>
                      <button className="btn" onClick={() => onEdit(t)}>Düzenle</button>
                      <button className="btn btn-danger" onClick={() => onDelete(t)}>Sil</button>
                    </>
                  )}
                  {canActOnDept && (
                    <>
                      <button className="btn btn-primary" onClick={() => onApprove(t)} disabled={!isPending || !!saving}>Onayla</button>
                      <button className="btn" onClick={() => onReject(t)} disabled={!isPending || !!saving}>Reddet</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

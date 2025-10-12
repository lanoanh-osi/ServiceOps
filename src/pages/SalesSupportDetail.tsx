import Header from "@/components/Layout/Header";
import DetailTopNav from "@/components/Layout/DetailTopNav";
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TicketDetail as TicketDetailType, fetchActivitySupportTicketDetail, updateActivitySupportInfo, updateActivitySupportResult } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlarmClock, Building2, MapPin, CheckCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="shadow-card">
    <CardContent className="p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      {children}
    </CardContent>
  </Card>
);

const SalesSupportDetail = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["ticket-detail", "sales", id],
    queryFn: async () => (await fetchActivitySupportTicketDetail(id || "")).data as TicketDetailType,
    enabled: Boolean(id),
  });

  // Normalize and map status for consistent UI
  const normalizedStatus = (() => {
    const label = String((data as any)?.statusDisplayLabel ?? "").toLowerCase().trim();
    if (label) {
      if (label.includes("tiếp nhận")) return "received";
      if (label.includes("đang thực hiện") || label.includes("đang xử lý")) return "in-progress";
      if (label.includes("hoàn tất") || label.includes("đã hoàn tất") || label.includes("completed")) return "completed";
      if (label.includes("phân công") || label.includes("assigned")) return "assigned";
    }
    const raw = (data?.status || "").toLowerCase();
    return raw as any;
  })();

  const isInProgress = normalizedStatus === "in-progress";
  const isCompleted = normalizedStatus === "completed";

  const statusDisplay = (() => {
    const apiLabel = (data as any)?.statusDisplayLabel;
    if (typeof apiLabel === "string" && apiLabel.trim()) return apiLabel;
    const s = (data?.status || "").toLowerCase();
    switch (s) {
      case "assigned":
        return "Đã phân công";
      case "in-progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn tất";
      case "received":
        return "Đã tiếp nhận";
      default:
        return "";
    }
  })();

  const [openResult, setOpenResult] = React.useState(false);
  const [resultNote, setResultNote] = React.useState("");
  const [openUpdateInfo, setOpenUpdateInfo] = React.useState(false);
  const [subject, setSubject] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [owner, setOwner] = React.useState<string>("");
  const [deadline, setDeadline] = React.useState<string>("");
  const [customerName, setCustomerName] = React.useState<string>("");
  const [contactName, setContactName] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");

  const prefillUpdateInfo = () => {
    setSubject(data?.activityInfo?.subject || "");
    setDescription(data?.activityInfo?.description || "");
    setOwner(data?.activityInfo?.owner || "");
    setDeadline(data?.deadline ? data.deadline.slice(0,16) : "");
    setCustomerName(data?.customerInfo?.name || "");
    setContactName(data?.customerInfo?.contactEmail ? data.customerInfo.contactEmail : "");
    setEmail(data?.customerInfo?.contactEmail || "");
    setPhone(data?.customerInfo?.contactPhone || "");
  };

  return (
    <div className="min-h-screen bg-background">
      <DetailTopNav title="Chi tiết Ticket" />
      <main className="container mx-auto px-4 py-6 pb-24 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {id && (
              <div className="px-3 py-2 rounded-md text-sm font-mono bg-blue-50 text-blue-700 border border-blue-200 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]">#{id}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* <Button variant="ghost" size="sm" onClick={() => { prefillUpdateInfo(); setOpenUpdateInfo(true); }}>Cập nhật thông tin</Button> */}
            {statusDisplay ? (
              <Badge variant="secondary" className="shrink-0">{statusDisplay}</Badge>
            ) : null}
          </div>
        </div>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
        {isError && <div className="text-sm text-red-600">Không tải được thông tin ticket.</div>}
        {data && (
          <div className="space-y-4">
            {/* Khách hàng & Liên hệ */}
            <Section title="Khách hàng & Liên hệ">
              <div className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.customerInfo?.name && (
                  <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{data.customerInfo.name}</span></div>
                )}
                {data.customerInfo?.contactPhone && (
                  <div className="flex items-center gap-2"><span className="text-muted-foreground">SĐT:</span><span>{data.customerInfo.contactPhone}</span></div>
                )}
                {data.customerInfo?.contactEmail && (
                  <div className="flex items-center gap-2"><span className="text-muted-foreground">Email:</span><span>{data.customerInfo.contactEmail}</span></div>
                )}
                {data.customerInfo?.address && (
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{data.customerInfo.address}</span></div>
                )}
              </div>
            </Section>

            {/* Thông tin hoạt động */}
            <Section title="Thông tin hoạt động">
              <div className="text-sm space-y-2">
                {data.subTypeLabel && (<div><span className="text-muted-foreground">Loại hoạt động:</span> <span className="font-medium">{data.subTypeLabel}</span></div>)}
                {data.activityInfo?.subject && (<div><span className="text-muted-foreground">Chủ đề:</span> {data.activityInfo.subject}</div>)}
                {data.activityInfo?.description && (<div><span className="text-muted-foreground">Mô tả:</span> {data.activityInfo.description}</div>)}
                {data.activityInfo?.owner && (<div><span className="text-muted-foreground">Phụ trách:</span> {data.activityInfo.owner}</div>)}
                {data.projectCode && (<div><span className="text-muted-foreground">Đơn hàng liên quan:</span> {data.projectCode}</div>)}
              </div>
            </Section>

            {/* Mốc thời gian */}
            <Section title="Mốc thời gian">
              <div className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.activityInfo?.startTime && (<div><span className="text-muted-foreground">Tạo lúc:</span> {formatDateTime(data.activityInfo.startTime)}</div>)}
                {data.deadline && (<div><span className="text-muted-foreground">Hạn:</span> <span className="text-orange-600 font-medium">{formatDateTime(data.deadline)}</span></div>)}
                {data.activityInfo?.endTime && (<div><span className="text-muted-foreground">Hoàn tất:</span> {formatDateTime(data.activityInfo.endTime)}</div>)}
              </div>
            </Section>

            {/* Kết quả hoạt động */}
            <Section title="Kết quả hoạt động">
              {data.activityResult?.time || data.activityResult?.note || data.notes ? (
                <div className="text-sm space-y-2">
                  {data.activityResult?.time && <div><span className="text-muted-foreground">Thời gian:</span> {formatDateTime(data.activityResult.time)}</div>}
                  {data.notes && <div><span className="text-muted-foreground">Tóm tắt:</span> {data.notes}</div>}
                  {data.activityResult?.note && <div><span className="text-muted-foreground">Nội dung:</span> {data.activityResult.note}</div>}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Chưa có thông tin</span>
                  <Button size="sm" onClick={() => setOpenResult(true)}>
                    <CheckCircle className="mr-2" /> Ghi nhận
                  </Button>
                </div>
              )}
            </Section>
          </div>
        )}
      </main>

      {/* Result dialog */}
      <Dialog open={openResult} onOpenChange={setOpenResult}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ghi nhận kết quả</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea placeholder="Nội dung kết quả..." value={resultNote} onChange={(e) => setResultNote(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpenResult(false)}>Hủy</Button>
              <Button onClick={async () => {
                if (!id) return;
                const res = await updateActivitySupportResult(id, { note: resultNote || undefined });
                if (res.success) setOpenResult(false);
              }}>
                <CheckCircle className="mr-2" /> Lưu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update info dialog */}
      <Dialog open={openUpdateInfo} onOpenChange={setOpenUpdateInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật thông tin</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input className="w-full border rounded p-2 text-sm" placeholder="Chủ đề" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <Textarea placeholder="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input className="w-full border rounded p-2 text-sm" placeholder="Phụ trách" value={owner} onChange={(e) => setOwner(e.target.value)} />
            <input className="w-full border rounded p-2 text-sm" type="datetime-local" placeholder="Hạn" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            <input className="w-full border rounded p-2 text-sm" placeholder="Khách hàng" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <input className="w-full border rounded p-2 text-sm" placeholder="Liên hệ" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            <input className="w-full border rounded p-2 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="w-full border rounded p-2 text-sm" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpenUpdateInfo(false)}>Hủy</Button>
              <Button onClick={async () => {
                if (!id) return;
                const res = await updateActivitySupportInfo(id, {
                  subject: subject || undefined,
                  description: description || undefined,
                  owner: owner || undefined,
                  deadline: deadline || undefined,
                  customer: customerName || undefined,
                  contactName: contactName || undefined,
                  email: email || undefined,
                  phone: phone || undefined,
                });
                if (res.success) setOpenUpdateInfo(false);
              }}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2">
          <Button size="lg" variant="outline" className="flex-1" onClick={() => { prefillUpdateInfo(); setOpenUpdateInfo(true); }}>
            Cập nhật thông tin
          </Button>
          {data && (normalizedStatus === "assigned" || isInProgress) && (
            <Button variant="secondary" size="lg" onClick={() => setOpenResult(true)} className="flex-1">
              <CheckCircle className="mr-2" /> Hoàn tất
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesSupportDetail;



import Header from "@/components/Layout/Header";
import DetailTopNav from "@/components/Layout/DetailTopNav";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TicketDetail as TicketDetailType, fetchDeliveryInstallTicketDetail, acceptDeliveryInstallTicket, completeDeliveryInstallTicket } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlarmClock, Building2, Mail, MapPin, Phone, PlayCircle, CheckCircle, Camera, X, Package, Receipt, Wrench, Tag, Info, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn, formatDate } from "@/lib/utils";
import { toast as notify } from "@/components/ui/sonner";
import React, { useRef, useState } from "react";

const Section = ({ title, icon, accentClass, rightSlot, children }: { title: string; icon?: React.ReactNode; accentClass?: string; rightSlot?: React.ReactNode; children: React.ReactNode }) => (
  <Card className="shadow-card">
    <CardContent className="p-4">
      <div className="mb-3 pb-1 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon ? <span className={cn("h-5 w-5", accentClass)}>{icon}</span> : null}
          <h3 className="text-[13px] font-semibold tracking-wide uppercase text-foreground">{title}</h3>
        </div>
        {rightSlot ? <div className="text-xs text-muted-foreground">{rightSlot}</div> : null}
      </div>
      {children}
    </CardContent>
  </Card>
);

const DeliveryInstallDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedGoods, setSelectedGoods] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper function để map trạng thái
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "assigned":
        return { label: "Đã phân công", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <Tag className="h-4 w-4" /> };
      case "in-progress":
        return { label: "Đang thực hiện", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <PlayCircle className="h-4 w-4" /> };
      case "completed":
        return { label: "Đã hoàn thành", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle className="h-4 w-4" /> };
      default:
        return { label: "Không xác định", color: "bg-gray-100 text-gray-800 border-gray-200", icon: <Info className="h-4 w-4" /> };
    }
  };

  // Helper function để map loại ticket
  const getTicketTypeInfo = (type: string) => {
    switch (type) {
      case "delivery":
        return { label: "Giao hàng & Lắp đặt", color: "bg-purple-100 text-purple-800 border-purple-200", icon: <Package className="h-4 w-4" /> };
      case "maintenance":
        return { label: "Bảo trì & Sửa chữa", color: "bg-orange-100 text-orange-800 border-orange-200", icon: <Wrench className="h-4 w-4" /> };
      case "sales":
        return { label: "Hoạt động & Hỗ trợ", color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: <Info className="h-4 w-4" /> };
      default:
        return { label: "Không xác định", color: "bg-gray-100 text-gray-800 border-gray-200", icon: <Info className="h-4 w-4" /> };
    }
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["ticket-detail", "delivery", id],
    queryFn: async () => (await fetchDeliveryInstallTicketDetail(id || "")).data as TicketDetailType,
    enabled: Boolean(id),
  });

  // Status từ API: assigned | in-progress | completed
  const isAssigned = data?.status === "assigned";
  const isInProgress = data?.status === "in-progress";
  const isCompleted = data?.status === "completed";

  // Chọn tất cả hàng hóa
  const handleSelectAllGoods = () => {
    const all = data?.orderInfo?.secretCodes?.map((it: any) => it.code) || [];
    if (selectedGoods.length === all.length) setSelectedGoods([]);
    else setSelectedGoods(all);
  };
  // Chọn tất cả thiết bị
  const handleSelectAllDevices = () => {
    const all = data?.deviceInfo?.map((d: any) => d.serial || "") || [];
    if (selectedDevices.length === all.length) setSelectedDevices([]);
    else setSelectedDevices(all);
  };

  // Xử lý chọn hàng hóa
  const handleGoodsChange = (code: string) => {
    setSelectedGoods((prev) => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };
  // Xử lý chọn thiết bị
  const handleDeviceChange = (serial: string) => {
    setSelectedDevices((prev) => prev.includes(serial) ? prev.filter(s => s !== serial) : [...prev, serial]);
  };

  // Xử lý chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRetakeImages = () => {
    setImages([]);
    fileInputRef.current?.click();
  };

  // Helper: convert File to base64 (no data URL prefix trimming; backend can accept full data URL or raw base64 depending on implementation)
  const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Xử lý hoàn tất báo cáo
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const base64Images = await Promise.all(images.map((f) => fileToBase64(f)));
      const res = await completeDeliveryInstallTicket({
        ticketId: id,
        note,
        productCodes: selectedGoods,
        serials: selectedDevices,
        base64Images,
      });
      if (res.success) {
        notify.success("Hoàn tất thành công", { description: `Ticket ${id} đã được cập nhật kết quả.` });
        setShowReportForm(false);
        setImages([]);
        setSelectedGoods([]);
        setSelectedDevices([]);
        setNote("");
        await refetch();
      } else {
        notify.error("Hoàn tất thất bại", { description: res.message || "Không thể gửi kết quả." });
      }
    } catch (err: any) {
      notify.error("Hoàn tất thất bại", { description: err?.message || "Lỗi không xác định" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DetailTopNav title="Chi tiết Ticket" />
      <main className="container mx-auto px-4 py-6 pb-24 space-y-4">
        {/* Thông tin trạng thái và loại ticket */}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {id && (
              <div className="w-full text-center px-3 py-2 rounded-md text-sm font-mono bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]">#{id} </div>
            )}
          </div>
          {/* <div className="flex gap-2 shrink-0">
            {(isInProgress || isCompleted) && <Badge variant="secondary">Đã tiếp nhận</Badge>}
          </div> */}
        </div>
        {data && (
          <div className="flex justify-between gap-3">
            <div className={`flex-1 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getTicketTypeInfo(data.type).color}`}>
              {getTicketTypeInfo(data.type).icon}
              {getTicketTypeInfo(data.type).label}
            </div>
            <div className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusInfo(data.status).color}`}>
              {getStatusInfo(data.status).icon}
              {data.statusDisplayLabel}
            </div>
          </div>
        )}
        {data && isCompleted && (
          <div className="mt-4 rounded-2xl border-2 border-primary/30 bg-primary/5 px-4 py-5 sm:px-6 sm:py-6 flex items-center justify-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="text-lg sm:text-xl font-semibold tracking-wide text-primary">ĐÃ HOÀN THÀNH</div>
          </div>
        )}

        
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
            {/* 1. Nhóm thông tin Khách hàng */}
            <Section title="Thông tin khách hàng" icon={<Building2 className="h-5 w-5" />} accentClass="text-sky-600">
              <div className="text-sm space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{data.customerInfo?.name}</span>
                </div>
                {data.customerInfo?.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{data.customerInfo.contactPhone}</span>
                  </div>
                )}
                {data.customerInfo?.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{data.customerInfo.contactEmail}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <AlarmClock className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-600 font-medium">Hạn: {formatDate(data.deadline)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{data.customerInfo?.address}</span>
                </div>
              </div>
            </Section>

            {/* 2. Nhóm thông tin về đơn hàng */}
            {data.orderInfo && (
              <Section title="Thông tin đơn hàng" icon={<Receipt className="h-5 w-5" />} accentClass="text-emerald-600">
                <div className="text-sm space-y-3">
                  {data.orderInfo.orderCode && (
                    <div>
                      Mã đơn hàng: <span className="font-medium">{data.orderInfo.orderCode}</span>
                    </div>
                  )}
                  {data.orderInfo.customerName && (
                    <div>
                      Khách hàng: <span className="font-medium">{data.orderInfo.customerName}</span>
                    </div>
                  )}
                  {data.orderInfo.totalAmount !== undefined && (
                    <div>
                      Tổng tiền: <span className="font-medium">{Intl.NumberFormat('vi-VN').format(Number(data.orderInfo.totalAmount))} đ</span>
                    </div>
                  )}
                  {data.orderInfo.orderDate && (
                    <div>
                      Ngày đặt: <span className="font-medium">{formatDate(data.orderInfo.orderDate)}</span>
                    </div>
                  )}
                  {data.orderInfo.deliveryDate && (
                    <div>
                      Ngày giao dự kiến: <span className="font-medium">{formatDate(data.orderInfo.deliveryDate)}</span>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* 3. Danh sách các hàng hóa */}
            {data.orderInfo?.secretCodes && data.orderInfo.secretCodes.length > 0 && (
              <Section title="Danh sách hàng hóa" icon={<Package className="h-5 w-5" />} accentClass="text-amber-600" rightSlot={<span>{data.orderInfo.secretCodes.length} mặt hàng</span>}>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[140px]">Mã hàng</TableHead>
                        <TableHead>Tên hàng</TableHead>
                        <TableHead className="w-[80px] text-right">SL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.orderInfo.secretCodes.map((it, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-xs text-muted-foreground">{it.code}</TableCell>
                          <TableCell>{it.name || "Mặt hàng"}</TableCell>
                          <TableCell className="text-right">x{it.quantity || 1}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Section>
            )}

            {/* 4. Danh sách thiết bị */}
            {data.deviceInfo && data.deviceInfo.length > 0 && (
              <Section title="Danh sách thiết bị" icon={<Wrench className="h-5 w-5" />} accentClass="text-violet-600" rightSlot={<span>{data.deviceInfo.length} thiết bị</span>}>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">S/N hoặc Mã TB</TableHead>
                        <TableHead>Tên thiết bị</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.deviceInfo.map((d, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-xs text-muted-foreground">{d.serial || `TB-${idx + 1}`}</TableCell>
                          <TableCell>{d.model || "Thiết bị"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Section>
            )}
          </div>
        )}

        {/* Form báo cáo kết quả hoàn tất */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <form className="bg-background rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-md md:max-w-lg space-y-4 relative max-h-[85vh] overflow-y-auto" onSubmit={handleSubmitReport}>
              <button type="button" aria-label="Đóng" className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" onClick={() => setShowReportForm(false)}>
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold mb-2">Báo cáo kết quả thực hiện</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Chụp ảnh kết quả</label>
                <input
                  ref={fileInputRef}
                  id="result-images"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Camera />
                    Chụp ảnh
                  </Button>
                  {images.length > 0 && (
                    <>
                      <Button type="button" variant="ghost" size="sm" onClick={handleRetakeImages}>Chụp lại</Button>
                      <span className="text-sm text-muted-foreground">{images.length} ảnh đã chọn</span>
                    </>
                  )}
                </div>
                {images.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={URL.createObjectURL(img)} alt="preview" className="h-16 w-16 object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-black/70 text-white text-xs"
                          aria-label="Xóa ảnh"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {data?.orderInfo?.secretCodes?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Chọn hàng hóa đã xử lý</label>
                  <button type="button" className="text-xs underline mb-2" onClick={handleSelectAllGoods}>{selectedGoods.length === (data.orderInfo.secretCodes?.length || 0) ? "Bỏ chọn tất cả" : "Chọn tất cả"}</button>
                  <div className="grid grid-cols-1 gap-2">
                    {data.orderInfo.secretCodes.map((it: any, idx: number) => (
                      <label key={idx} className="flex items-center gap-2 border rounded p-2">
                        <input type="checkbox" checked={selectedGoods.includes(it.code)} onChange={() => handleGoodsChange(it.code)} />
                        <span className="text-xs font-mono">{it.code}</span>
                        <span className="text-sm">{it.name || "Mặt hàng"}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {data?.deviceInfo?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Chọn thiết bị đã xử lý</label>
                  <button type="button" className="text-xs underline mb-2" onClick={handleSelectAllDevices}>{selectedDevices.length === (data.deviceInfo?.length || 0) ? "Bỏ chọn tất cả" : "Chọn tất cả"}</button>
                  <div className="grid grid-cols-1 gap-2">
                    {data.deviceInfo.map((d: any, idx: number) => (
                      <label key={idx} className="flex items-center gap-2 border rounded p-2">
                        <input type="checkbox" checked={selectedDevices.includes(d.serial)} onChange={() => handleDeviceChange(d.serial)} />
                        <span className="text-xs font-mono">{d.serial || `TB-${idx + 1}`}</span>
                        <span className="text-sm">{d.model || "Thiết bị"}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Ghi chú</label>
                <textarea className="w-full border rounded p-2" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Nhập ghi chú cho kỹ thuật viên..." />
              </div>
              <Button type="submit" size="lg" className="w-full">
                <CheckCircle />
                Hoàn tất
              </Button>
            </form>
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2">
          {data && isAssigned && (
            <Button onClick={async () => { 
              if (!id) return; 
              const res = await acceptDeliveryInstallTicket(id); 
              if (res.success) { 
                setShowSuccessModal(true);
                await refetch(); 
              } 
            }} size="lg" className="flex-1">
              <PlayCircle />
              Tiếp nhận thực hiện
            </Button>
          )}
          {data && isInProgress && (
            <Button variant="secondary" size="lg" onClick={() => setShowReportForm(true)} className="flex-1">
              <CheckCircle />
              Hoàn tất
            </Button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Tiếp nhận thành công</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Ticket #{id} đã chuyển sang trạng thái đang thực hiện.
              </p>
            </div>
            <Button 
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/delivery-install");
              }} 
              className="w-full"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryInstallDetail;



import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  checkDeviceBySerial, 
  fetchMaintenanceTicketCategories, 
  fetchMaintenanceTicketTypes, 
  createEmergencyMaintenanceTicket, 
  CreateEmergencyMaintenanceInput,
  DeviceInfo 
} from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, AlertCircle } from "lucide-react";

interface CreateEmergencyMaintenanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateEmergencyMaintenanceForm: React.FC<CreateEmergencyMaintenanceFormProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  
  // Form state
  const [formData, setFormData] = useState<CreateEmergencyMaintenanceInput>({
    name: "",
    phone: "",
    email: "",
    company: "",
    serial: "",
    issue: "",
    category: "none",
    service_type: "none",
    arrive_time: "",
    complete_time: ""
  });
  
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isCheckingDevice, setIsCheckingDevice] = useState(false);

  // Fetch maintenance ticket categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["maintenance-categories"],
    queryFn: async () => (await fetchMaintenanceTicketCategories()).data || [],
    enabled: open,
  });

  // Fetch maintenance ticket types
  const { data: serviceTypes, isLoading: isLoadingTypes } = useQuery({
    queryKey: ["maintenance-types"],
    queryFn: async () => (await fetchMaintenanceTicketTypes()).data || [],
    enabled: open,
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: createEmergencyMaintenanceTicket,
    onSuccess: () => {
      toast.success("Tạo ticket khẩn cấp thành công!");
      queryClient.invalidateQueries({ queryKey: ["tickets", "maintenance"] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Có lỗi xảy ra khi tạo ticket");
    },
  });

  const handleClose = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      company: "",
      serial: "",
      issue: "",
      category: "none",
      service_type: "none",
      arrive_time: "",
      complete_time: ""
    });
    setDeviceInfo(null);
    onOpenChange(false);
  };

  const handleCheckDevice = async () => {
    if (!formData.serial.trim()) {
      toast.error("Vui lòng nhập Serial Number");
      return;
    }

    setIsCheckingDevice(true);
    try {
      console.log("Checking device with serial:", formData.serial);
      const result = await checkDeviceBySerial(formData.serial);
      console.log("Device check result:", result);
      
      if (result.success && result.data) {
        setDeviceInfo(result.data);
        toast.success("Kiểm tra thiết bị thành công!");
      } else {
        setDeviceInfo(null);
        toast.error(result.message || "Serial không tồn tại");
      }
    } catch (error) {
      console.error("Device check error:", error);
      setDeviceInfo(null);
      toast.error("Có lỗi xảy ra khi kiểm tra thiết bị");
    } finally {
      setIsCheckingDevice(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }
    
    if (!formData.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    if (!formData.serial.trim()) {
      toast.error("Vui lòng nhập Serial Number");
      return;
    }

    const submitData = {
      ...formData,
      category: formData.category === "none" ? "" : formData.category,
      service_type: formData.service_type === "none" ? "" : formData.service_type,
      // Add device info if available
      brand: deviceInfo?.brand || "",
      model: deviceInfo?.model || "",
    };

    createTicketMutation.mutate(submitData);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo xử lý khẩn cấp</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ và tên */}
          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          {/* Số điện thoại */}
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Nhập số điện thoại"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Nhập email"
            />
          </div>

          {/* Công ty/Đơn vị */}
          <div className="space-y-2">
            <Label htmlFor="company">Công ty/Đơn vị</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Nhập tên công ty/đơn vị"
            />
          </div>

          {/* Serial Number với nút check */}
          <div className="space-y-2">
            <Label htmlFor="serial">Serial Number *</Label>
            <div className="flex gap-2">
              <Input
                id="serial"
                value={formData.serial}
                onChange={(e) => setFormData(prev => ({ ...prev, serial: e.target.value }))}
                placeholder="Nhập Serial Number"
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCheckDevice}
                disabled={isCheckingDevice || !formData.serial.trim()}
                className="px-3"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Hiển thị thông tin thiết bị */}
            {deviceInfo && (deviceInfo.brand || deviceInfo.model || deviceInfo["install-date"]) && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm space-y-1">
                  {deviceInfo.brand && deviceInfo.brand !== "undefined" && (
                    <div><span className="font-medium">Hãng:</span> {deviceInfo.brand}</div>
                  )}
                  {deviceInfo.model && deviceInfo.model !== "undefined" && (
                    <div><span className="font-medium">Model:</span> {deviceInfo.model}</div>
                  )}
                  {deviceInfo["install-date"] && deviceInfo["install-date"] !== "undefined" && (
                    <div><span className="font-medium">Ngày lắp đặt:</span> {formatDate(deviceInfo["install-date"])}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mô tả vấn đề */}
          <div className="space-y-2">
            <Label htmlFor="issue">Mô tả vấn đề</Label>
            <Textarea
              id="issue"
              value={formData.issue}
              onChange={(e) => setFormData(prev => ({ ...prev, issue: e.target.value }))}
              placeholder="Nhập mô tả chi tiết vấn đề"
              rows={3}
            />
          </div>

          {/* Phân loại */}
          <div className="space-y-2">
            <Label htmlFor="category">Phân loại</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phân loại" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCategories ? (
                  <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                ) : (
                  <>
                    <SelectItem value="none">-- Chọn phân loại --</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Loại dịch vụ */}
          <div className="space-y-2">
            <Label htmlFor="service_type">Loại dịch vụ</Label>
            <Select
              value={formData.service_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTypes ? (
                  <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                ) : (
                  <>
                    <SelectItem value="none">-- Chọn loại dịch vụ --</SelectItem>
                    {serviceTypes?.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Đến nơi lúc */}
          <div className="space-y-2">
            <Label htmlFor="arrive_time">Đến nơi lúc</Label>
            <Input
              id="arrive_time"
              type="datetime-local"
              value={formData.arrive_time}
              onChange={(e) => setFormData(prev => ({ ...prev, arrive_time: e.target.value }))}
            />
          </div>

          {/* Hoàn thành lúc */}
          <div className="space-y-2">
            <Label htmlFor="complete_time">Hoàn thành lúc</Label>
            <Input
              id="complete_time"
              type="datetime-local"
              value={formData.complete_time}
              onChange={(e) => setFormData(prev => ({ ...prev, complete_time: e.target.value }))}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={createTicketMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {createTicketMutation.isPending ? "Đang tạo..." : "Tạo ticket khẩn cấp"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEmergencyMaintenanceForm;

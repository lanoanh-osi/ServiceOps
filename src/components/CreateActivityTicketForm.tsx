import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchActivityTypes, createActivitySupportTicket, CreateActivitySupportTicketInput } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CreateActivityTicketFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateActivityTicketForm: React.FC<CreateActivityTicketFormProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  
  // Form state
  const [formData, setFormData] = useState<CreateActivitySupportTicketInput>({
    name: "",
    description: "",
    customer_name: "",
    type: "none",
    deadline: "",
    status: "Chưa bắt đầu",
    complete_date: "",
    note: ""
  });
  
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch activity types
  const { data: activityTypes, isLoading: isLoadingTypes } = useQuery({
    queryKey: ["activity-types"],
    queryFn: async () => (await fetchActivityTypes()).data || [],
    enabled: open,
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: createActivitySupportTicket,
    onSuccess: () => {
      toast.success("Tạo ticket thành công!");
      queryClient.invalidateQueries({ queryKey: ["tickets", "sales"] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Có lỗi xảy ra khi tạo ticket");
    },
  });

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      customer_name: "",
      type: "none",
      deadline: "",
      status: "Chưa bắt đầu",
      complete_date: "",
      note: ""
    });
    setIsCompleted(false);
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên hoạt động");
      return;
    }
    
    if (!formData.customer_name.trim()) {
      toast.error("Vui lòng nhập tên khách hàng");
      return;
    }

    const submitData = {
      ...formData,
      type: formData.type === "none" ? "" : formData.type,
      status: isCompleted ? "Đã hoàn thành" : "Chưa bắt đầu",
      complete_date: isCompleted ? formData.complete_date : undefined,
    };

    createTicketMutation.mutate(submitData);
  };

  const handleCompletedChange = (checked: boolean) => {
    setIsCompleted(checked);
    if (checked) {
      // Set completion date to current date/time if not set
      if (!formData.complete_date) {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setFormData(prev => ({ ...prev, complete_date: localDateTime }));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Ticket Hoạt động & Hỗ trợ</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên hoạt động */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên hoạt động *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên hoạt động"
              required
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Nhập mô tả chi tiết"
              rows={3}
            />
          </div>

          {/* Khách hàng */}
          <div className="space-y-2">
            <Label htmlFor="customer">Khách hàng *</Label>
            <Input
              id="customer"
              value={formData.customer_name}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
              placeholder="Nhập tên khách hàng"
              required
            />
          </div>

          {/* Loại hoạt động */}
          <div className="space-y-2">
            <Label htmlFor="type">Loại hoạt động</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại hoạt động" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTypes ? (
                  <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                ) : (
                  <>
                    <SelectItem value="none">-- Chọn loại hoạt động --</SelectItem>
                    {activityTypes?.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Hạn hoàn thành */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Hạn hoàn thành</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
            />
          </div>

          {/* Checkbox Đã hoàn thành */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={isCompleted}
              onCheckedChange={handleCompletedChange}
            />
            <Label htmlFor="completed">Đã hoàn thành</Label>
          </div>

          {/* Ngày hoàn thành - chỉ hiển thị khi checkbox được check */}
          {isCompleted && (
            <div className="space-y-2">
              <Label htmlFor="complete_date">Ngày hoàn thành</Label>
              <Input
                id="complete_date"
                type="datetime-local"
                value={formData.complete_date}
                onChange={(e) => setFormData(prev => ({ ...prev, complete_date: e.target.value }))}
                required={isCompleted}
              />
            </div>
          )}

          {/* Ghi chú */}
          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Nhập ghi chú"
              rows={3}
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
              className="bg-blue-500 hover:bg-blue-600"
            >
              {createTicketMutation.isPending ? "Đang tạo..." : "Tạo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateActivityTicketForm;

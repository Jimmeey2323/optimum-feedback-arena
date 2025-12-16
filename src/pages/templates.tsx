import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  Star,
  Sparkles,
  Calendar,
  CreditCard,
  Users,
  AlertTriangle,
  Smartphone,
  MessageSquare,
  Settings,
  Package,
  Headphones,
  Filter,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TicketTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  subcategory?: string;
  priority: string;
  suggestedTitle: string;
  suggestedDescription: string;
  tags: string[];
  color: string;
  isCustom?: boolean;
  usageCount?: number;
  lastUsed?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Calendar,
  CreditCard,
  Users,
  AlertTriangle,
  Smartphone,
  MessageSquare,
  Settings,
  Package,
  Headphones,
  Star,
  FileText,
};

const DEFAULT_TEMPLATES: TicketTemplate[] = [
  {
    id: "booking-issue",
    name: "Booking Failed",
    description: "Customer unable to book classes through app or website",
    icon: Calendar,
    category: "Booking & Technology",
    subcategory: "Class Booking",
    priority: "high",
    suggestedTitle: "Class Booking Issue - Unable to Complete Reservation",
    suggestedDescription: "Customer experienced issues while attempting to book a class.\n\nError details: [describe error]\nDevice: [iOS/Android/Web]\nSteps tried: [list attempts]\n\nPlease investigate and assist.",
    tags: ["booking", "technical", "app"],
    color: "from-blue-500 to-cyan-500",
    usageCount: 156,
    lastUsed: "2 hours ago",
  },
  {
    id: "payment-problem",
    name: "Payment Issue",
    description: "Problems with payment processing or billing",
    icon: CreditCard,
    category: "Booking & Technology",
    subcategory: "Payment Processing",
    priority: "high",
    suggestedTitle: "Payment Processing Error - Transaction Failed",
    suggestedDescription: "Customer encountered a payment issue.\n\nAmount: [amount]\nPayment method: [card/UPI/other]\nError message received: [error]\nTransaction ID (if any): [id]\n\nUrgent resolution required.",
    tags: ["payment", "billing", "urgent"],
    color: "from-emerald-500 to-teal-500",
    usageCount: 89,
    lastUsed: "5 hours ago",
  },
  {
    id: "instructor-feedback",
    name: "Instructor Feedback",
    description: "Feedback or concern about instructor performance",
    icon: Star,
    category: "Customer Service",
    subcategory: "Staff Professionalism",
    priority: "medium",
    suggestedTitle: "Instructor Feedback - [Instructor Name]",
    suggestedDescription: "Customer feedback regarding instructor.\n\nInstructor Name: [name]\nClass attended: [class type]\nDate: [date]\nNature of feedback: [positive/constructive]\n\nDetails:\n[specifics]",
    tags: ["instructor", "feedback", "class"],
    color: "from-purple-500 to-pink-500",
    usageCount: 234,
    lastUsed: "1 hour ago",
  },
  {
    id: "membership-inquiry",
    name: "Membership Query",
    description: "Questions about memberships, packages, or pricing",
    icon: Users,
    category: "Sales & Marketing",
    subcategory: "Trial Class Experience",
    priority: "medium",
    suggestedTitle: "Membership Inquiry - [Package Type]",
    suggestedDescription: "Customer is inquiring about membership options.\n\nMembership type: [type]\nCurrent status: [new/existing]\nSpecific questions:\n- [question 1]\n- [question 2]\n\nPreferred contact method: [email/phone]",
    tags: ["membership", "sales", "inquiry"],
    color: "from-amber-500 to-orange-500",
    usageCount: 178,
    lastUsed: "30 minutes ago",
  },
  {
    id: "safety-incident",
    name: "Safety Incident",
    description: "Report an injury or safety concern during class",
    icon: AlertTriangle,
    category: "Health & Safety",
    subcategory: "Injury During Class",
    priority: "critical",
    suggestedTitle: "URGENT: Safety Incident Report - [Studio Location]",
    suggestedDescription: "⚠️ URGENT: Safety incident occurred.\n\nTime: [time]\nLocation: [studio]\nType of incident: [injury/hazard]\nPerson(s) involved: [names]\n\nImmediate action taken: [steps]\nMedical attention: [required/not required]\n\nWitnesses: [names if any]",
    tags: ["safety", "urgent", "incident"],
    color: "from-red-500 to-rose-500",
    usageCount: 12,
    lastUsed: "3 days ago",
  },
  {
    id: "app-technical",
    name: "App Technical Issue",
    description: "Technical problems with mobile app or website",
    icon: Smartphone,
    category: "Booking & Technology",
    subcategory: "App Issues",
    priority: "medium",
    suggestedTitle: "Technical Issue - [App/Website] - [Brief Description]",
    suggestedDescription: "Technical issue reported.\n\nPlatform: [iOS/Android/Web]\nApp version: [version]\nDevice: [model]\n\nIssue description:\n[details]\n\nScreenshot attached: [yes/no]\nReproducible: [yes/no]",
    tags: ["technical", "app", "bug"],
    color: "from-indigo-500 to-blue-500",
    usageCount: 67,
    lastUsed: "4 hours ago",
  },
  {
    id: "equipment-issue",
    name: "Equipment Problem",
    description: "Broken, missing, or malfunctioning equipment",
    icon: Settings,
    category: "Health & Safety",
    subcategory: "Equipment Safety",
    priority: "high",
    suggestedTitle: "Equipment Issue - [Equipment Type] at [Studio]",
    suggestedDescription: "Equipment issue reported.\n\nEquipment: [type/name]\nLocation: [studio/room]\nIssue: [broken/missing/malfunction]\n\nWhen noticed: [date/time]\nSafety risk: [high/medium/low]\nImmediate action needed: [yes/no]",
    tags: ["equipment", "maintenance", "safety"],
    color: "from-orange-500 to-red-500",
    usageCount: 34,
    lastUsed: "1 day ago",
  },
  {
    id: "retail-product",
    name: "Retail/Product Issue",
    description: "Problems with retail purchases or product quality",
    icon: Package,
    category: "Retail Management",
    subcategory: "Product Quality",
    priority: "low",
    suggestedTitle: "Retail Product Issue - [Product Name]",
    suggestedDescription: "Product issue reported.\n\nProduct: [name]\nPurchase date: [date]\nReceipt number: [number]\n\nIssue: [defective/wrong size/quality]\nResolution requested: [exchange/refund]\nPhotos attached: [yes/no]",
    tags: ["retail", "product", "refund"],
    color: "from-violet-500 to-purple-500",
    usageCount: 23,
    lastUsed: "2 days ago",
  },
  {
    id: "front-desk",
    name: "Front Desk Issue",
    description: "Service quality at reception or front desk",
    icon: Headphones,
    category: "Customer Service",
    subcategory: "Front Desk Service",
    priority: "medium",
    suggestedTitle: "Front Desk Service Feedback - [Studio]",
    suggestedDescription: "Service feedback for front desk.\n\nStudio: [location]\nStaff member (if known): [name]\nDate/time of visit: [date/time]\n\nNature of interaction: [check-in/inquiry/complaint]\nDetails:\n[specifics]",
    tags: ["service", "front-desk", "feedback"],
    color: "from-cyan-500 to-blue-500",
    usageCount: 45,
    lastUsed: "6 hours ago",
  },
];

export default function Templates() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TicketTemplate[]>(DEFAULT_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "",
    priority: "medium",
    suggestedTitle: "",
    suggestedDescription: "",
    tags: "",
  });

  const categories = [...new Set(templates.map(t => t.category))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      (template.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.tags ?? []).some(tag => (tag ?? '').toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || template.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleUseTemplate = (template: TicketTemplate) => {
    navigate(`/tickets/new?template=${template.id}`);
    toast({
      title: "Template selected",
      description: `Using "${template.name}" template`,
    });
  };

  const handleCreateTemplate = () => {
    const id = `custom-${Date.now()}`;
    const newTemplateData: TicketTemplate = {
      id,
      name: newTemplate.name,
      description: newTemplate.description,
      icon: FileText,
      category: newTemplate.category || "Custom",
      priority: newTemplate.priority,
      suggestedTitle: newTemplate.suggestedTitle,
      suggestedDescription: newTemplate.suggestedDescription,
      tags: (newTemplate.tags ?? '').split(",").map(t => t.trim()).filter(Boolean),
      color: "from-slate-500 to-gray-500",
      isCustom: true,
      usageCount: 0,
    };
    setTemplates([newTemplateData, ...templates]);
    setIsCreateDialogOpen(false);
    setNewTemplate({
      name: "",
      description: "",
      category: "",
      priority: "medium",
      suggestedTitle: "",
      suggestedDescription: "",
      tags: "",
    });
    toast({
      title: "Template created",
      description: `"${newTemplate.name}" has been added to your templates`,
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast({
      title: "Template deleted",
      description: "The template has been removed",
    });
  };

  const handleDuplicateTemplate = (template: TicketTemplate) => {
    const newId = `${template.id}-copy-${Date.now()}`;
    const duplicated: TicketTemplate = {
      ...template,
      id: newId,
      name: `${template.name} (Copy)`,
      isCustom: true,
      usageCount: 0,
    };
    setTemplates([duplicated, ...templates]);
    toast({
      title: "Template duplicated",
      description: `Created a copy of "${template.name}"`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text-accent">Ticket Templates</h1>
            <p className="text-sm text-muted-foreground">
              Quick-start templates for common ticket types
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/30">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a reusable template for common ticket types
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    placeholder="e.g., Refund Request"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    placeholder="e.g., Billing"
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Brief description of when to use this template"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Priority</Label>
                  <Select
                    value={newTemplate.priority}
                    onValueChange={(value) => setNewTemplate({ ...newTemplate, priority: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    placeholder="refund, billing, urgent"
                    value={newTemplate.tags}
                    onChange={(e) => setNewTemplate({ ...newTemplate, tags: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Suggested Title</Label>
                <Input
                  placeholder="Default ticket title"
                  value={newTemplate.suggestedTitle}
                  onChange={(e) => setNewTemplate({ ...newTemplate, suggestedTitle: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Suggested Description</Label>
                <Textarea
                  placeholder="Default ticket description with placeholders like [customer name]"
                  value={newTemplate.suggestedDescription}
                  onChange={(e) => setNewTemplate({ ...newTemplate, suggestedDescription: e.target.value })}
                  className="rounded-xl min-h-32"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} disabled={!newTemplate.name} className="rounded-xl">
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 rounded-xl">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36 rounded-xl">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center border rounded-xl overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid/List */}
      <div className={cn(
        viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          : "space-y-4"
      )}>
        <AnimatePresence>
          {filteredTemplates.map((template, index) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "glass-card group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden",
                  viewMode === "list" && "flex"
                )}>
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br",
                    template.color
                  )} />
                  
                  <CardContent className={cn(
                    "p-5 relative",
                    viewMode === "list" && "flex items-center gap-4 flex-1"
                  )}>
                    <div className={cn(
                      viewMode === "grid" ? "space-y-4" : "flex items-center gap-4 flex-1"
                    )}>
                      {/* Icon & Title */}
                      <div className={cn(
                        "flex items-start gap-3",
                        viewMode === "list" && "flex-1"
                      )}>
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                          "bg-gradient-to-br shadow-lg",
                          template.color
                        )}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{template.name}</h3>
                            {template.isCustom && (
                              <Badge variant="outline" className="text-xs">Custom</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>

                      {/* Tags & Meta */}
                      {viewMode === "grid" && (
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={
                            template.priority === "critical" ? "destructive" :
                            template.priority === "high" ? "default" : "secondary"
                          }>
                            {template.priority}
                          </Badge>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                      )}

                      {/* Stats */}
                      {viewMode === "grid" && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                          <span>{template.usageCount || 0} uses</span>
                          {template.lastUsed && <span>Last: {template.lastUsed}</span>}
                        </div>
                      )}

                      {/* List view badges */}
                      {viewMode === "list" && (
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            template.priority === "critical" ? "destructive" :
                            template.priority === "high" ? "default" : "secondary"
                          }>
                            {template.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {template.usageCount || 0} uses
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className={cn(
                      "flex gap-2",
                      viewMode === "grid" 
                        ? "pt-4 border-t border-border/50" 
                        : "shrink-0"
                    )}>
                      <Button
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                        className="rounded-lg flex-1"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Use
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicateTemplate(template)}
                        className="rounded-lg"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {template.isCustom && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="rounded-lg text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={() => { setSearchQuery(""); setCategoryFilter("all"); setPriorityFilter("all"); }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

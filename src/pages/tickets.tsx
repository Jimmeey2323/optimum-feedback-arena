import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Search,
  Plus,
  Download,
  ChevronDown,
  X,
  SlidersHorizontal,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TicketCard } from "@/components/ticket-card";
import { EmptyState } from "@/components/empty-state";
import { TicketCardSkeleton } from "@/components/loading-skeleton";
import { PRIORITIES } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

const STATUSES = {
  new: { label: "New", color: "bg-blue-500" },
  assigned: { label: "Assigned", color: "bg-purple-500" },
  in_progress: { label: "In Progress", color: "bg-amber-500" },
  pending_customer: { label: "Pending Customer", color: "bg-orange-500" },
  resolved: { label: "Resolved", color: "bg-emerald-500" },
  closed: { label: "Closed", color: "bg-slate-500" },
  reopened: { label: "Reopened", color: "bg-red-500" },
};

export default function Tickets() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [studioFilter, setStudioFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());

  // Fetch categories from Supabase
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, code')
        .eq('isActive', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch studios from Supabase
  const { data: studios = [] } = useQuery({
    queryKey: ['studios-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('studios')
        .select('id, name, code')
        .eq('isActive', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch tickets from Supabase with filters
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', searchQuery, statusFilter, priorityFilter, categoryFilter, studioFilter],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          category:categories(id, name, code, icon, color),
          subcategory:subcategories(id, name, code),
          studio:studios(id, name, code)
        `)
        .order('createdAt', { ascending: false });

      // Apply filters
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }
      if (priorityFilter !== "all") {
        query = query.eq('priority', priorityFilter);
      }
      if (categoryFilter !== "all") {
        query = query.eq('categoryId', categoryFilter);
      }
      if (studioFilter !== "all") {
        query = query.eq('studioId', studioFilter);
      }
      if (searchQuery) {
        query = query.or(`ticketNumber.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%,customerName.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const activeFiltersCount = [statusFilter, priorityFilter, categoryFilter, studioFilter]
    .filter(f => f !== "all").length;

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
    setStudioFilter("all");
    setSearchQuery("");
  };

  const toggleTicketSelection = (id: string) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTickets(newSelected);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Ticket className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text-accent">All Tickets</h1>
              <p className="text-sm text-muted-foreground">
                Manage and track customer feedback and issues
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-xl border-border hover:bg-muted">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild className="rounded-xl bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/30 font-semibold">
            <Link href="/tickets/new">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Link>
          </Button>
        </div>
      </div>

      <Card className="glass-card border-0 shadow-xl">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets by number, title, or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-xl border-border"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-xl"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.entries(STATUSES).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-36 rounded-xl">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {Object.entries(PRIORITIES).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48 rounded-xl">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={studioFilter} onValueChange={setStudioFilter}>
                  <SelectTrigger className="w-48 rounded-xl">
                    <SelectValue placeholder="Studio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Studios</SelectItem>
                    {studios.map((studio: any) => (
                      <SelectItem key={studio.id} value={studio.id}>
                        {studio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="rounded-xl text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
            )}

            {activeFiltersCount > 0 && !showFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    Status: {STATUSES[statusFilter as keyof typeof STATUSES]?.label || statusFilter}
                    <button onClick={() => setStatusFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {priorityFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    Priority: {PRIORITIES[priorityFilter as keyof typeof PRIORITIES]?.label || priorityFilter}
                    <button onClick={() => setPriorityFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    Category: {categories.find((c: any) => c.id === categoryFilter)?.name || categoryFilter}
                    <button onClick={() => setCategoryFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {studioFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    Studio: {studios.find((s: any) => s.id === studioFilter)?.name || studioFilter}
                    <button onClick={() => setStudioFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedTickets.size > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">
                {selectedTickets.size} ticket{selectedTickets.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Bulk Actions
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Assign to Team</DropdownMenuItem>
                    <DropdownMenuItem>Change Status</DropdownMenuItem>
                    <DropdownMenuItem>Change Priority</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Close Tickets</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTickets(new Set())}
                  className="rounded-xl"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <TicketCardSkeleton key={i} />
            ))}
          </>
        ) : tickets && tickets.length > 0 ? (
          tickets.map((ticket: any) => (
            <div key={ticket.id} className="flex items-start gap-3">
              <Checkbox
                checked={selectedTickets.has(ticket.id)}
                onCheckedChange={() => toggleTicketSelection(ticket.id)}
                className="mt-5"
              />
              <div className="flex-1">
                <TicketCard ticket={ticket} />
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="No tickets found"
            description={
              activeFiltersCount > 0 || searchQuery
                ? "Try adjusting your filters or search query"
                : "Create your first ticket to get started"
            }
            action={
              activeFiltersCount > 0 || searchQuery
                ? { label: "Clear Filters", onClick: clearFilters }
                : { label: "Create Ticket", onClick: () => navigate("/tickets/new") }
            }
          />
        )}
      </div>

      {tickets && tickets.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</span>
        </div>
      )}
    </div>
  );
}

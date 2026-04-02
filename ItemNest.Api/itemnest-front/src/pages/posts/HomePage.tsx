import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { getCategories } from "../../api/categoryApi";
import { getPosts } from "../../api/itemPostApi";
import PageState from "../../components/common/PageState";
import Pagination from "../../components/common/Pagination";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import PostCard from "../../components/posts/PostCard";
import { useAuth } from "../../context/AuthContext";
import type { Category } from "../../types/category";
import type { ItemPost, PostFilterParams } from "../../types/post";
import { getApiErrorMessage } from "../../utils/error";
import { itemColorOptions, postTypeOptions } from "../../utils/options";

const sortByOptions = [
  { label: "Newest", value: "createdAt-desc" },
  { label: "Oldest", value: "createdAt-asc" },
  { label: "Event Date (Newest)", value: "eventDate-desc" },
  { label: "Event Date (Oldest)", value: "eventDate-asc" },
  { label: "Title (A-Z)", value: "title-asc" },
  { label: "Title (Z-A)", value: "title-desc" },
];

const postStatusOptions = [
  { label: "Open", value: 0 },
  { label: "Returned", value: 1 },
  { label: "Closed", value: 2 },
];

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
}

function createFilterState(searchParams: URLSearchParams, canManageStatuses: boolean) {
  return {
    searchTerm: searchParams.get("search") ?? "",
    location: searchParams.get("location") ?? "",
    type: parseOptionalNumber(searchParams.get("type")),
    status: canManageStatuses
      ? parseOptionalNumber(searchParams.get("status"))
      : undefined,
    color: parseOptionalNumber(searchParams.get("color")),
    categoryId: parseOptionalNumber(searchParams.get("categoryId")),
    sortValue: searchParams.get("sort") ?? "createdAt-desc",
  };
}

export default function HomePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = user?.roles.includes("Admin") ?? false;

  const initialFilters = useMemo(
    () => createFilterState(searchParams, isAdmin),
    [searchParams, isAdmin]
  );

  const [posts, setPosts] = useState<ItemPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pageNumber, setPageNumber] = useState(
    Math.max(1, parseOptionalNumber(searchParams.get("page")) ?? 1)
  );
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [categoryErrorMessage, setCategoryErrorMessage] = useState("");
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(createFilterState(searchParams, isAdmin));
    setPageNumber(Math.max(1, parseOptionalNumber(searchParams.get("page")) ?? 1));
  }, [searchParams, isAdmin]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await getCategories();
        setCategories(response);
        setCategoryErrorMessage("");
      } catch (error: any) {
        setCategoryErrorMessage(getApiErrorMessage(error));
      }
    }

    void loadCategories();
  }, []);

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [sortBy, sortDirection] = filters.sortValue.split("-");

        const params: PostFilterParams = {
          pageNumber,
          pageSize,
          searchTerm: filters.searchTerm || undefined,
          location: filters.location || undefined,
          type: filters.type,
          status: isAdmin ? filters.status : undefined,
          color: filters.color,
          categoryId: filters.categoryId,
          sortBy,
          sortDirection,
        };

        const response = await getPosts(params);

        setPosts(response.items);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadPosts();
  }, [filters, isAdmin, pageNumber, pageSize]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageNumber]);

  function updateSearchParams(nextFilters: typeof filters, nextPageNumber = 1) {
    const nextParams = new URLSearchParams();

    if (nextFilters.searchTerm) {
      nextParams.set("search", nextFilters.searchTerm);
    }

    if (nextFilters.location) {
      nextParams.set("location", nextFilters.location);
    }

    if (typeof nextFilters.type === "number") {
      nextParams.set("type", String(nextFilters.type));
    }

    if (isAdmin && typeof nextFilters.status === "number") {
      nextParams.set("status", String(nextFilters.status));
    }

    if (typeof nextFilters.color === "number") {
      nextParams.set("color", String(nextFilters.color));
    }

    if (typeof nextFilters.categoryId === "number") {
      nextParams.set("categoryId", String(nextFilters.categoryId));
    }

    if (nextFilters.sortValue !== "createdAt-desc") {
      nextParams.set("sort", nextFilters.sortValue);
    }

    if (nextPageNumber > 1) {
      nextParams.set("page", String(nextPageNumber));
    }

    setSearchParams(nextParams, { replace: true });
  }

  function handleApplyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSearchParams(filters, 1);
  }

  function handleClearFilters() {
    const clearedFilters = {
      searchTerm: "",
      location: "",
      type: undefined,
      status: undefined,
      color: undefined,
      categoryId: undefined,
      sortValue: "createdAt-desc",
    };

    setFilters(clearedFilters);
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  function handlePageChange(nextPage: number) {
    setPageNumber(nextPage);
    updateSearchParams(filters, nextPage);
  }

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const hasAnyFilter =
    Boolean(filters.searchTerm) ||
    Boolean(filters.location) ||
    typeof filters.type === "number" ||
    (isAdmin && typeof filters.status === "number") ||
    typeof filters.color === "number" ||
    typeof filters.categoryId === "number" ||
    filters.sortValue !== "createdAt-desc";

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Browse posts
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Search across lost and found posts using practical filters for item type,
          category, color, and location.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Filters</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {isAdmin
                    ? "Admins can also filter by post status."
                    : "Public browsing shows open posts only."}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Results
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {totalCount}
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleApplyFilters}>
              <FormInput
                label="Search"
                value={filters.searchTerm}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, searchTerm: value }))
                }
                placeholder="Title or description"
              />

              <FormInput
                label="Location"
                value={filters.location}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, location: value }))
                }
                placeholder="City, district, place"
              />

              <FormSelect
                label="Type"
                value={filters.type ?? ""}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    type: value === "" ? undefined : Number(value),
                  }))
                }
                options={postTypeOptions}
                placeholder="All types"
              />

              {isAdmin && (
                <FormSelect
                  label="Status"
                  value={filters.status ?? ""}
                  onChange={(value) =>
                    setFilters((current) => ({
                      ...current,
                      status: value === "" ? undefined : Number(value),
                    }))
                  }
                  options={postStatusOptions}
                  placeholder="All statuses"
                />
              )}

              <FormSelect
                label="Category"
                value={filters.categoryId ?? ""}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    categoryId: value === "" ? undefined : Number(value),
                  }))
                }
                options={categoryOptions}
                placeholder="All categories"
              />

              <FormSelect
                label="Color"
                value={filters.color ?? ""}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    color: value === "" ? undefined : Number(value),
                  }))
                }
                options={itemColorOptions}
                placeholder="All colors"
              />

              <FormSelect
                label="Sort By"
                value={filters.sortValue}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, sortValue: value }))
                }
                options={sortByOptions}
              />

              {categoryErrorMessage && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                  Categories could not be loaded right now. You can still browse posts.
                </div>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  Apply Filters
                </button>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              </div>

              {hasAnyFilter && (
                <p className="text-xs leading-5 text-slate-500">
                  Custom filters are active.
                </p>
              )}
            </form>
          </section>
        </aside>

        <div className="space-y-5">
          {isLoading || errorMessage || posts.length === 0 ? (
            <PageState
              isLoading={isLoading}
              errorMessage={errorMessage}
              isEmpty={!isLoading && !errorMessage && posts.length === 0}
              emptyMessage={
                hasAnyFilter
                  ? "No posts matched your current filters. Try broader criteria."
                  : "No posts found."
              }
            />
          ) : (
            <>
              <section className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </section>

              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
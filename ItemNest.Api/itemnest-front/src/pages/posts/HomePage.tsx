import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
    status: canManageStatuses ? parseOptionalNumber(searchParams.get("status")) : undefined,
    color: parseOptionalNumber(searchParams.get("color")),
    categoryId: parseOptionalNumber(searchParams.get("categoryId")),
    sortValue: searchParams.get("sort") ?? "createdAt-desc",
  };
}

export default function HomePage() {
  const { t } = useTranslation();
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
  const [pageSize] = useState(9);
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

  const postTypeOptions = [
    { label: t("post.lost"), value: 0 },
    { label: t("post.found"), value: 1 },
  ];

  const postStatusOptions = [
    { label: t("post.open"), value: 0 },
    { label: t("post.returned"), value: 1 },
    { label: t("post.closed"), value: 2 },
  ];

  const itemColorOptions = [
    { label: t("common.unknown"), value: 0 },
    { label: t("post.black"), value: 1 },
    { label: t("post.white"), value: 2 },
    { label: t("post.gray"), value: 3 },
    { label: t("post.blue"), value: 4 },
    { label: t("post.red"), value: 5 },
    { label: t("post.green"), value: 6 },
    { label: t("post.yellow"), value: 7 },
    { label: t("post.brown"), value: 8 },
    { label: t("post.pink"), value: 9 },
    { label: t("post.purple"), value: 10 },
    { label: t("post.orange"), value: 11 },
    { label: t("post.silver"), value: 12 },
    { label: t("post.gold"), value: 13 },
  ];

  const sortByOptions = [
    { label: t("common.newest"), value: "createdAt-desc" },
    { label: t("common.oldest"), value: "createdAt-asc" },
    { label: t("common.eventDateNewest"), value: "eventDate-desc" },
    { label: t("common.eventDateOldest"), value: "eventDate-asc" },
    { label: t("common.titleAsc"), value: "title-asc" },
    { label: t("common.titleDesc"), value: "title-desc" },
  ];

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
          {t("home.title")}
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          {t("home.description")}
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {t("common.filters")}
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {isAdmin ? t("home.adminStatusHint") : t("home.publicStatusHint")}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("common.results")}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{totalCount}</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleApplyFilters}>
              <FormInput
                label={t("common.search")}
                value={filters.searchTerm}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, searchTerm: value }))
                }
                placeholder={t("home.searchPlaceholder")}
              />

              <FormInput
                label={t("common.location")}
                value={filters.location}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, location: value }))
                }
                placeholder={t("home.locationPlaceholder")}
              />

              <FormSelect
                label={t("common.type")}
                value={filters.type ?? ""}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    type: value === "" ? undefined : Number(value),
                  }))
                }
                options={postTypeOptions}
                placeholder={t("common.allTypes")}
              />

              {isAdmin && (
                <FormSelect
                  label={t("common.status")}
                  value={filters.status ?? ""}
                  onChange={(value) =>
                    setFilters((current) => ({
                      ...current,
                      status: value === "" ? undefined : Number(value),
                    }))
                  }
                  options={postStatusOptions}
                  placeholder={t("common.allStatuses")}
                />
              )}

              <FormSelect
                label={t("common.category")}
                value={filters.categoryId ?? ""}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    categoryId: value === "" ? undefined : Number(value),
                  }))
                }
                options={categoryOptions}
                placeholder={t("common.allCategories")}
              />

              <FormSelect
                label={t("common.color")}
                value={filters.color ?? ""}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    color: value === "" ? undefined : Number(value),
                  }))
                }
                options={itemColorOptions}
                placeholder={t("common.allColors")}
              />

              <FormSelect
                label={t("common.sortBy")}
                value={filters.sortValue}
                onChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    sortValue: value,
                  }))
                }
                options={sortByOptions}
              />

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  {t("common.applyFilters")}
                </button>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                >
                  {t("common.clearFilters")}
                </button>
              </div>
            </form>

            {categoryErrorMessage && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                {t("home.categoriesLoadFailed")}
              </div>
            )}
          </section>
        </aside>

        <section className="space-y-4">
          {hasAnyFilter && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {t("home.customFiltersActive")}
            </div>
          )}

          <PageState
            isLoading={isLoading}
            errorMessage={errorMessage}
            isEmpty={!isLoading && !errorMessage && posts.length === 0}
            emptyMessage={hasAnyFilter ? t("home.noFilteredResults") : t("home.noPosts")}
          />

          {!isLoading && !errorMessage && posts.length > 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
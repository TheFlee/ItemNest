import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LLink } from "../../components/common/LLink";
import { getCategories } from "../../api/categoryApi";
import { getPosts } from "../../api/itemPostApi";
import PageState from "../../components/common/PageState";
import Pagination from "../../components/common/Pagination";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import PostCard from "../../components/posts/PostCard";
import PostCardSkeleton from "../../components/posts/PostCardSkeleton";
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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
      <title>{t("home.hero.title")} | ItemNest</title>
      <meta name="description" content={t("home.hero.subtitle")} />
      <meta property="og:title" content={`${t("home.hero.title")} | ItemNest`} />
      <meta property="og:description" content={t("home.hero.subtitle")} />
      <meta property="og:type" content="website" />

      {/* ── Guest hero ──────────────────────────────────────────────── */}
      {!user && (
        <section
          className="relative overflow-hidden rounded-3xl"
          style={{ background: "linear-gradient(145deg, #fdf7ef 0%, #faeada 55%, #f3d4ac 100%)" }}
        >
          {/* Dot grid texture */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(194,105,42,0.13) 1.5px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative z-10 grid items-center gap-10 px-8 py-14 sm:py-20 lg:grid-cols-[1fr_auto] lg:gap-16 lg:px-16">
            {/* Left: editorial content */}
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/8 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                <span className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
                  {t("brand.tagline")}
                </span>
              </div>

              {/* Headline */}
              <h1
                className="text-4xl font-bold leading-[1.07] tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("home.hero.title")}
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-[var(--text-secondary)]">
                {t("home.hero.subtitle")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LLink
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/25 transition hover:bg-[var(--accent-hover)] active:scale-[0.98]"
                >
                  <ion-icon name="search-outline" style={{ fontSize: "15px" }} />
                  {t("home.hero.ctaLost")}
                </LLink>
                <LLink
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white/80 px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-white hover:shadow-sm active:scale-[0.98]"
                >
                  <ion-icon name="hand-left-outline" style={{ fontSize: "15px" }} />
                  {t("home.hero.ctaFound")}
                </LLink>
              </div>
            </div>

            {/* Right: concentric-ring focal art */}
            <div className="hidden lg:flex lg:shrink-0 lg:items-center lg:justify-center">
              <div className="relative h-64 w-64">
                {/* Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/10" />
                <div className="absolute inset-5 rounded-full border-2 border-[var(--accent)]/15" />
                <div className="absolute inset-10 rounded-full border-2 border-[var(--accent)]/22" />
                <div className="absolute inset-16 rounded-full border-2 border-[var(--accent)]/35" />

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full shadow-2xl shadow-[var(--accent)]/30"
                    style={{ background: "var(--accent)" }}
                  >
                    <ion-icon name="search-outline" style={{ fontSize: "34px", color: "white" }} />
                  </div>
                </div>

                {/* Orbiting badges */}
                <div className="absolute -top-1 right-10 flex items-center justify-center rounded-full bg-white p-2.5 shadow-md">
                  <ion-icon name="location-outline" style={{ fontSize: "15px", color: "var(--accent)" }} />
                </div>
                <div className="absolute bottom-6 -left-2 flex items-center justify-center rounded-full bg-white p-2.5 shadow-md">
                  <ion-icon name="pricetag-outline" style={{ fontSize: "15px", color: "var(--success)" }} />
                </div>
                <div className="absolute right-1 top-16 flex items-center justify-center rounded-full bg-white p-2.5 shadow-md">
                  <ion-icon name="heart-outline" style={{ fontSize: "15px", color: "var(--accent)" }} />
                </div>
                <div className="absolute bottom-16 right-0 flex items-center justify-center rounded-full bg-white p-2.5 shadow-md">
                  <ion-icon name="people-outline" style={{ fontSize: "15px", color: "var(--text-secondary)" }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Authenticated browse header ──────────────────────────────── */}
      {user && (
        <section className="flex items-end justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("home.title")}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              {t("home.description")}
            </p>
          </div>

          {!isLoading && totalCount > 0 && (
            <div className="shrink-0 text-right">
              <p
                className="text-3xl font-bold text-[var(--accent)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {totalCount}
              </p>
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-secondary)]">
                {t("common.results")}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ── Mobile filter toggle ─────────────────────────────────────── */}
      <div className="xl:hidden">
        <button
          type="button"
          onClick={() => setMobileFilterOpen((o) => !o)}
          className="inline-flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm transition hover:border-[var(--accent)]/40 hover:bg-[var(--bg-surface)]"
        >
          <ion-icon
            name={mobileFilterOpen ? "close-outline" : "options-outline"}
            style={{ fontSize: "15px" }}
          />
          {mobileFilterOpen ? t("home.hideFilters") : t("home.showFilters")}
          {hasAnyFilter && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white">
              !
            </span>
          )}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">

        {/* ── Filter sidebar ───────────────────────────────────────── */}
        <aside className={`self-start xl:sticky xl:top-4 ${mobileFilterOpen ? "block" : "hidden xl:block"}`}>
          <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm">

            {/* Sidebar header */}
            <div className="border-b border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ion-icon
                    name="options-outline"
                    style={{ fontSize: "15px", color: "var(--accent)" }}
                  />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">
                    {t("common.filters")}
                  </h2>
                </div>
                {totalCount > 0 && (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    {totalCount}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[11px] leading-5 text-[var(--text-secondary)]">
                {isAdmin ? t("home.adminStatusHint") : t("home.publicStatusHint")}
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4 p-5" onSubmit={handleApplyFilters}>
              <FormInput
                label={t("common.search")}
                value={filters.searchTerm}
                onChange={(value) => setFilters((c) => ({ ...c, searchTerm: value }))}
                placeholder={t("home.searchPlaceholder")}
                icon="search-outline"
              />
              <FormInput
                label={t("common.location")}
                value={filters.location}
                onChange={(value) => setFilters((c) => ({ ...c, location: value }))}
                placeholder={t("home.locationPlaceholder")}
                icon="location-outline"
              />
              <FormSelect
                label={t("common.type")}
                value={filters.type ?? ""}
                onChange={(value) => setFilters((c) => ({ ...c, type: value === "" ? undefined : Number(value) }))}
                options={postTypeOptions}
                placeholder={t("common.allTypes")}
              />
              {isAdmin && (
                <FormSelect
                  label={t("common.status")}
                  value={filters.status ?? ""}
                  onChange={(value) => setFilters((c) => ({ ...c, status: value === "" ? undefined : Number(value) }))}
                  options={postStatusOptions}
                  placeholder={t("common.allStatuses")}
                />
              )}
              <FormSelect
                label={t("common.category")}
                value={filters.categoryId ?? ""}
                onChange={(value) => setFilters((c) => ({ ...c, categoryId: value === "" ? undefined : Number(value) }))}
                options={categoryOptions}
                placeholder={t("common.allCategories")}
              />
              <FormSelect
                label={t("common.color")}
                value={filters.color ?? ""}
                onChange={(value) => setFilters((c) => ({ ...c, color: value === "" ? undefined : Number(value) }))}
                options={itemColorOptions}
                placeholder={t("common.allColors")}
              />
              <FormSelect
                label={t("common.sortBy")}
                value={filters.sortValue}
                onChange={(value) => setFilters((c) => ({ ...c, sortValue: value }))}
                options={sortByOptions}
              />

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)] active:scale-[0.98]"
                >
                  <ion-icon name="filter-outline" style={{ fontSize: "14px" }} />
                  {t("common.applyFilters")}
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
                >
                  {t("common.clearFilters")}
                </button>
              </div>
            </form>

            {categoryErrorMessage && (
              <div className="mx-5 mb-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                {t("home.categoriesLoadFailed")}
              </div>
            )}
          </section>
        </aside>

        {/* ── Posts section ────────────────────────────────────────── */}
        <section className="space-y-4">

          {/* Active filters banner */}
          {hasAnyFilter && (
            <div className="flex items-center gap-2.5 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-2.5">
              <ion-icon name="funnel" style={{ fontSize: "13px", color: "var(--accent)" }} />
              <span className="flex-1 text-xs font-medium text-[var(--text-secondary)]">
                {t("home.customFiltersActive")}
              </span>
              <button
                type="button"
                onClick={handleClearFilters}
                className="shrink-0 text-xs font-semibold text-[var(--accent)] transition hover:text-[var(--accent-hover)]"
              >
                {t("common.clearFilters")}
              </button>
            </div>
          )}

          {isLoading ? (
            <PostCardSkeleton />
          ) : (
            <PageState
              isLoading={false}
              errorMessage={errorMessage}
              isEmpty={!errorMessage && posts.length === 0}
              emptyMessage={hasAnyFilter ? t("home.noFilteredResults") : t("home.noPosts")}
            />
          )}

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

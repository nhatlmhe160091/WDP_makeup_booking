"use client";

import Link from "next/link";
import { CardContent, Typography, Grid, Tooltip, Avatar, Chip, Box } from "@mui/material";
import { Stack } from "@mui/system";
import BlankCard from "@muahub/app/makeup-artists/components/shared/BlankCard";
import Image from "next/image";
import { useEffect, useState } from "react";


const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Filter states
  const [ownerId, setOwnerId] = useState("");
  const [muaList, setMuaList] = useState([]);
  const [status, setStatus] = useState("published");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Fetch blogs with filters
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (ownerId) params.append("ownerId", ownerId);
        if (status) params.append("status", status);
        if (category) params.append("category", category);
        if (page) params.append("page", page);
        if (limit) params.append("limit", limit);
        const res = await fetch(`/api/blogs?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setBlogs(data.data);
          setPagination(data.pagination || { total: 0, totalPages: 1 });
        } else {
          setError(data.error || "Lỗi không xác định");
        }
      } catch (err) {
        setError("Không thể tải dữ liệu blog");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [ownerId, status, category, page, limit]);

  // Fetch MUA list for ownerId filter
  useEffect(() => {
    const fetchMuaList = async () => {
      try {
        const res = await fetch("/api/users/mua");
        const data = await res.json();
        if (data.success) {
          setMuaList(data.data || []);
        }
      } catch (err) {
        // ignore error, fallback to empty
      }
    };
    fetchMuaList();
  }, []);

  // Filter handlers
  const handleOwnerIdChange = (e) => setOwnerId(e.target.value);
  const handleStatusChange = (e) => setStatus(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handleLimitChange = (e) => setLimit(Number(e.target.value));
  const handlePageChange = (newPage) => setPage(newPage);

  if (loading) return <Typography>Đang tải blog...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className="container-fluid makeup-list-bg py-5">
      <div className="container py-5">
        {/* Filters Section */}
        <div className="row mb-3 align-items-center">
          <div className="col-md-3 mb-2">
            <select className="form-select border-pink" value={ownerId} onChange={handleOwnerIdChange}>
              <option value="">Tất cả MUA</option>
              {muaList.map((mua) => (
                <option key={mua._id} value={mua._id}>
                  {mua.fullname || mua.name || mua.email || mua._id}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 mb-2">
            <select className="form-select border-pink" value={status} onChange={handleStatusChange}>
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
          <div className="col-md-3 mb-2">
            <select className="form-select border-pink" value={category} onChange={handleCategoryChange}>
              <option value="">Tất cả danh mục</option>
              <option value="Makeup cơ bản">Makeup cơ bản</option>
              <option value="Makeup dự tiệc">Makeup dự tiệc</option>
              <option value="Makeup cô dâu">Makeup cô dâu</option>
              <option value="Chăm sóc da">Chăm sóc da</option>
              <option value="Xu hướng makeup">Xu hướng makeup</option>
              <option value="Mẹo làm đẹp">Mẹo làm đẹp</option>
            </select>
          </div>
          <div className="col-md-3 mb-2">
            <select className="form-select border-pink" value={limit} onChange={handleLimitChange}>
              {[6, 12, 24, 48].map((num) => (
                <option key={num} value={num}>{num} blog/trang</option>
              ))}
            </select>
          </div>
        </div>
        {/* Blog List */}
        <Grid container spacing={3}>
          {blogs.length === 0 && (
            <Grid item xs={12}>
              <Typography>Không có blog nào.</Typography>
            </Grid>
          )}
          {blogs.map((blog) => (
            <Grid item xs={12} md={4} lg={3} key={blog._id}>
              <BlankCard sx={{ position: "relative", height: "100%" }}>
                <Box component={Link} href={`/blog/${blog.slug || blog._id}`} sx={{ display: "block" }}>
                  {blog.coverImage ? (
                    <Box sx={{ width: "100%", height: 200, position: "relative" }}>
                      <Image
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        style={{ objectFit: "cover", borderRadius: 8 }}
                      />
                    </Box>
                  ) : (
                    <Avatar
                      variant="square"
                      sx={{ height: 200, width: "100%", fontSize: 32 }}
                    >
                      {blog.title?.[0] || "B"}
                    </Avatar>
                  )}
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography variant="h6" component={Link} href={`/blog/${blog.slug || blog._id}`} sx={{ textDecoration: "none", color: "inherit" }}>
                      {blog.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {blog.summary || blog.metaDescription || blog.content?.slice(0, 80) + "..."}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {blog.category && <Chip label={blog.category} size="small" />}
                      <Typography variant="caption" color="text.secondary">
                        {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : ""}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption">Lượt xem: {blog.views || 0}</Typography>
                      <Typography variant="caption">Thích: {blog.likes || 0}</Typography>
                      <Typography variant="caption">Bình luận: {blog.comments?.length || 0}</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </BlankCard>
            </Grid>
          ))}
        </Grid>
        {/* Pagination */}
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item${page === 1 ? " disabled" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>&laquo;</button>
              </li>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <li key={i + 1} className={`page-item${page === i + 1 ? " active" : ""}`}>
                  <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item${page === pagination.totalPages ? " disabled" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(page + 1)} disabled={page === pagination.totalPages}>&raquo;</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Blog;

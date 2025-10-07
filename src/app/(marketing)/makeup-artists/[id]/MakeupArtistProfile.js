"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar, Box, Typography, Grid, Button, Rating, Paper, Divider, Chip } from "@mui/material";
import {
  Person,
  Email,
  Phone,
  AccessTime,
  WorkHistory,
  Star,
  Message,
  AccountBalance,
  Lock,
  Warning
} from "@mui/icons-material";

const MakeupArtistProfile = ({ artist }) => {
  const [selectedPortfolioImage, setSelectedPortfolioImage] = useState(null);
  const [currentTab, setCurrentTab] = useState("portfolio"); // portfolio, reviews, certificates

  if (!artist.isActive) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning d-flex align-items-center">
          <Lock sx={{ mr: 2 }} />
          <Typography>This account is temporarily unavailable</Typography>
        </div>
      </div>
    );
  }

  if (!artist.profileComplete) {
    return (
      <div className="container py-5">
        <div className="alert alert-info d-flex align-items-center">
          <Warning sx={{ mr: 2 }} />
          <Typography>Profile is being updated</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Basic Info Section */}
      <Paper elevation={3} className="p-4 mb-4">
        <Grid container spacing={4}>
          <Grid item xs={12} md={3} className="text-center">
            <Avatar
              src={artist.avatar}
              alt={artist.name}
              sx={{ width: 200, height: 200, margin: "0 auto" }}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <Typography variant="h4" gutterBottom>
              {artist.name}
              {artist.isVerified && (
                <Chip
                  icon={<Star />}
                  label="Verified Artist"
                  color="primary"
                  size="small"
                  className="ms-2"
                />
              )}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {artist.bio}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <WorkHistory sx={{ mr: 1 }} />
                  <Typography>
                    Experience: {artist.experienceYears} years {artist.experienceMonths} months
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <AccessTime sx={{ mr: 1 }} />
                  <Typography>
                    Available: {artist.workingHours}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Phone sx={{ mr: 1 }} />
                  <Typography>
                    <a href={`tel:${artist.phone}`}>{artist.phone}</a>
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <Email sx={{ mr: 1 }} />
                  <Typography>
                    <a href={`mailto:${artist.email}`}>{artist.email}</a>
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Message />}
                onClick={() => window.location.href = `/message/${artist._id}`}
              >
                Contact Now
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation Tabs */}
      <Box mb={3}>
        <Button
          variant={currentTab === "portfolio" ? "contained" : "outlined"}
          onClick={() => setCurrentTab("portfolio")}
          sx={{ mr: 2 }}
        >
          Portfolio
        </Button>
        <Button
          variant={currentTab === "reviews" ? "contained" : "outlined"}
          onClick={() => setCurrentTab("reviews")}
          sx={{ mr: 2 }}
        >
          Reviews & Comments
        </Button>
        <Button
          variant={currentTab === "certificates" ? "contained" : "outlined"}
          onClick={() => setCurrentTab("certificates")}
        >
          Certificates
        </Button>
      </Box>

      {/* Portfolio Section */}
      {currentTab === "portfolio" && (
        <Paper elevation={3} className="p-4">
          <Typography variant="h5" gutterBottom>
            Portfolio
          </Typography>
          <Grid container spacing={2}>
            {artist.portfolio?.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <div 
                  className="position-relative"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedPortfolioImage(item)}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.description}
                    width={300}
                    height={300}
                    objectFit="cover"
                    className="rounded"
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 p-2 bg-dark bg-opacity-75 text-white">
                    <Typography variant="subtitle2">
                      {item.description}
                    </Typography>
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Reviews Section */}
      {currentTab === "reviews" && (
        <Paper elevation={3} className="p-4">
          <Typography variant="h5" gutterBottom>
            Reviews & Comments
          </Typography>
          {artist.reviews?.map((review, index) => (
            <Box key={index} mb={3}>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar src={review.userAvatar} alt={review.userName} />
                <Box ml={2}>
                  <Typography variant="subtitle1">{review.userName}</Typography>
                  <Rating value={review.rating} readOnly />
                </Box>
              </Box>
              <Typography variant="body1">{review.comment}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(review.date).toLocaleDateString()}
              </Typography>
              <Divider sx={{ my: 2 }} />
            </Box>
          ))}
        </Paper>
      )}

      {/* Certificates Section */}
      {currentTab === "certificates" && (
        <Paper elevation={3} className="p-4">
          <Typography variant="h5" gutterBottom>
            Professional Certificates
          </Typography>
          <Grid container spacing={2}>
            {artist.certificates?.map((cert, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={2} className="p-3">
                  <Typography variant="h6">{cert.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Issued by: {cert.issuedBy}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(cert.issueDate).toLocaleDateString()}
                  </Typography>
                  {cert.imageUrl && (
                    <Image
                      src={cert.imageUrl}
                      alt={cert.name}
                      width={300}
                      height={200}
                      objectFit="contain"
                      className="mt-2"
                    />
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Portfolio Image Modal */}
      {selectedPortfolioImage && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center"
          style={{ zIndex: 1050 }}
          onClick={() => setSelectedPortfolioImage(null)}
        >
          <div className="position-relative" style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
            <Image
              src={selectedPortfolioImage.imageUrl}
              alt={selectedPortfolioImage.description}
              width={800}
              height={600}
              objectFit="contain"
            />
            <Typography
              className="position-absolute bottom-0 start-0 w-100 p-3 bg-dark bg-opacity-75 text-white"
            >
              {selectedPortfolioImage.description}
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
};

export default MakeupArtistProfile;
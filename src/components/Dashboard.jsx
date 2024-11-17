/**
 * Dashboard Component
 * Provides a timeline visualization using VIS Timeline and MUI.
 * Displays schedule data with controls for navigation and date range selection.
 */
import { useState, useRef, useEffect } from "react";
import { scheduleData } from "../utils/data";
import {
  Box,
  Button,
  ButtonGroup,
  Typography,
  Stack,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Timeline, DataSet } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import moment from "moment";
import { controlsDays, userEnums, timeEnums } from "../utils/enums";

const Dashboard = () => {
  const containerRef = useRef(null); // Reference to the timeline container DOM element
  const timelineRef = useRef(null); // Reference to the VIS Timeline instance
  const [dateRange, setDateRange] = useState(""); // Tracks the current date range displayed

  const [controlIndex, setControlIndex] = useState(
    controlsDays.findIndex(
      (item) =>
        item.value.value === timeEnums.MONTH_1.value &&
        item.value.unit === timeEnums.MONTH_1.unit
    )
  );

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));

  /**
   * Finds and returns user details such as name and className by ID.
   * If the user is not found, returns default mock data.
   */

  const getUser = (userEnums, id) => {
    try {
      const userData = userEnums.find((item) => item.id === id);
      if (userData && userData.name) {
        return userData;
      }
    } catch (error) {
      console.error("Error in getUser:", error);
    }
    return {
      name: "Mock",
      className: "red",
    };
  };

  /**
   * Combines overlapping events for better timeline visualization.
   * Handles overlapping events either generally or with overridden processes.
   */
  const mergeEvents = (events, isOverridenProcess = false) => {
    const merged = [];
    try {
      const eventsCopy = JSON.parse(JSON.stringify(events));
      const groupedByUserId = eventsCopy.reduce((acc, event) => {
        acc[event.userId] = acc[event.userId] || [];
        acc[event.userId].push(event);
        return acc;
      }, {});

      let overridenId = Date.now();
      Object.keys(groupedByUserId).forEach((userId) => {
        const groupEvents = groupedByUserId[userId];
        const groupedByClass = groupEvents.reduce((acc, event) => {
          acc[event.group] = acc[event.group] || [];
          acc[event.group].push(event);
          return acc;
        }, {});

        // Handle each class group separately

        Object.keys(groupedByClass).forEach((grpClass) => {
          const userEvents = groupedByClass[grpClass];
          userEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

          const result = [];
          let current = userEvents[0];

          for (let i = 1; i < userEvents.length; i++) {
            const next = userEvents[i];
            // For overridden processes, split overlapping events
            if (isOverridenProcess) {
              if (new Date(current.end) > new Date(next.start)) {
                const newData = {
                  ...current,
                  start: next.start,
                  id: overridenId++,
                };
                result.push(newData);
                current = next;
              } else {
                current = next;
              }
            } else {
              // Merge overlapping events in general
              if (new Date(next.start) <= new Date(current.end)) {
                current.end =
                  new Date(current.end) > new Date(next.end)
                    ? current.end
                    : next.end;
              } else {
                result.push(current);
                current = next;
              }
            }
          }
          if (isOverridenProcess) {
            current.id = overridenId++;
          }
          result.push(current);
          merged.push(...result);
        });
      });
    } catch (error) {
      console.error("Error in mergeEvents:", error);
    }
    return merged;
  };

  /**
   * Prepares the dataset for timeline items and groups.
   * Converts raw schedule data into a format suitable for VIS Timeline.
   */

  const prepareTimelineData = (data) => {
    let items = [];
    const groups = [];
    const itemsDataset = new DataSet();
    const groupsDataset = new DataSet();
    let id = 1;

    // Add events for the current layer
    data.layers.forEach((layer) => {
      const groupName = `Layer ${layer.number}`;
      groups.push({ id: groupName, content: groupName });
      layer.layers.forEach((entry) => {
        const user = getUser(userEnums, entry.userId);
        items.push({
          id: id++,
          content: user.name,
          userId: entry.userId,
          start: entry.startDate,
          end: entry.endDate,
          group: groupName,
          title: user.name,
          className: user.className,
        });
      });
    });

    // Add overridden and final schedule layers
    groups.push({ id: "override Layer", content: "Override Layer" });
    const overridenData = mergeEvents(items, true);
    items = items.concat(overridenData);

    groups.push({ id: "Final Schedule", content: "Final Schedule" });
    data.finalSchedule.forEach((entry) => {
      const user = getUser(userEnums, entry.userId);
      items.push({
        id: id++,
        content: user.name,
        userId: entry.userId,
        start: entry.startDate,
        end: entry.endDate,
        group: "Final Schedule",
        title: user.name,
        className: user.className,
      });
    });

    const mergedItems = mergeEvents(items);
    itemsDataset.add(mergedItems);
    groupsDataset.add(groups);

    return { itemsDataset, groupsDataset };
  };

  /**
   * Initializes the VIS Timeline instance with the prepared data and options.
   */
  const initializeTimeline = (data) => {
    if (containerRef.current) {
      const { itemsDataset, groupsDataset } = prepareTimelineData(data);

      const options = {
        orientation: { axis: "top", item: "bottom" },
        horizontalScroll: true,
        zoomable: true,
        showTooltips: true,
      };

      timelineRef.current = new Timeline(
        containerRef.current,
        itemsDataset,
        groupsDataset,
        options
      );
      handleTodayClick();
    }
  };

  /**
   * Adjusts the timeline view to focus on the current date range.
   * Updates the displayed range label based on the configured time interval.
   */
  const handleTodayClick = () => {
    if (timelineRef.current) {
      let min_startDate = null;
      scheduleData.layers.forEach((layer) => {
        layer.layers.forEach((entry) => {
          if (min_startDate == null) {
            min_startDate = new Date(entry.startDate);
          } else {
            min_startDate =
              new Date(entry.startDate) < min_startDate
                ? new Date(entry.startDate)
                : min_startDate;
          }
        });
      });

      const now = moment(min_startDate || new Date()).startOf("day");

      // Get the currently selected view (unit and value)
      const currentView = controlsDays[controlIndex]?.value || {
        unit: "days",
        value: 1,
      };

      const howMuchAgo = now.clone().add(currentView.value, currentView.unit);

      let formattedRange = "";
      if (currentView.unit == "days") {
        if (currentView.value == 1) {
          formattedRange = `${now.format("D MMM YYYY")}`;
        } else {
          const endDate = now
            .clone()
            .add(currentView.value - 1, currentView.unit); // Subtract 1 to show the exact number of days
          formattedRange = `${now.format("D MMM YYYY")} - ${endDate.format(
            "D MMM YYYY"
          )}`;
        }
      } else if (currentView.unit == "weeks") {
        const endDate = now.clone().add(currentView.value * 7 - 1, "days"); // Subtract 1 to show the exact number of days
        formattedRange = `${now.format("D MMM YYYY")} - ${endDate.format(
          "D MMM YYYY"
        )}`;
      } else if (currentView.unit == "months") {
        formattedRange = now.format("MMM YYYY");
      } else {
        formattedRange = "";
      }

      setDateRange(formattedRange);
      setTimeout(() => {
        timelineRef.current.setWindow(now.toDate(), howMuchAgo.toDate());
      }, 1000);
    }
  };

  useEffect(() => {
    initializeTimeline(scheduleData);
    return () => timelineRef.current?.destroy();
  }, []);

  const handlePrevClick = () => {
    setControlIndex((prevIndex) => {
      const newIndex =
        prevIndex - 1 < 0 ? controlsDays.length - 1 : prevIndex - 1;
      return newIndex;
    });
  };

  const handleNextClick = () => {
    setControlIndex((prevIndex) => {
      const newIndex = prevIndex + 1 >= controlsDays.length ? 0 : prevIndex + 1;
      return newIndex;
    });
  };

  return (
    <Box sx={{ padding: 2 }}>
      {/* Main container with padding */}
      <Box
        display="flex"
        flexDirection={isSmallScreen ? "column" : "row"}
        alignItems={isSmallScreen ? "stretch" : "center"}
        justifyContent="flex-start"
        mb={3}
        gap={2}
      >
        {/* Buttons and controls container */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleTodayClick}
          fullWidth={isSmallScreen}
          sx={{
            marginBottom: isSmallScreen ? 2 : 0,
            padding: isSmallScreen ? "12px" : "8px",
            marginLeft: isSmallScreen ? 0 : 5,
          }}
        >
          Today
        </Button>
        <Stack
          direction="row"
          spacing={1}
          justifyContent={isSmallScreen ? "center" : "flex-start"}
          alignItems="center"
          sx={{
            marginTop: isSmallScreen ? -2 : 0,
            marginLeft: isSmallScreen ? 0 : 2,
            justifyContent: isSmallScreen ? "center" : "flex-start",
          }}
        >
          <IconButton
            color="primary"
            onClick={handlePrevClick}
            size="small"
            sx={{
              color: "primary.main",
              backgroundColor: "rgba(25, 118, 210, 0.1)",
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.2)",
              },
            }}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={handleNextClick}
            size="small"
            sx={{
              color: "primary.main",
              backgroundColor: "rgba(25, 118, 210, 0.1)",
              "&:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.2)",
              },
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Stack>
        <ButtonGroup
          variant="contained"
          fullWidth={isSmallScreen}
          sx={{
            display: "flex",
            flexDirection: isSmallScreen ? "row" : "row",
            justifyContent: isSmallScreen ? "center" : "flex-start",
            marginLeft: isSmallScreen ? 0 : 85,
            marginLeft: isMediumScreen ? 5 : 0,
            marginLeft: isLargeScreen ? 85 : 0,
          }}
        >
          {controlsDays.map((control, idx) => (
            <Button
              key={`${control.value.unit}-${control.value.value}`}
              onClick={() => setControlIndex(idx)}
              className={controlIndex === idx ? "test-color" : ""}
              sx={{
                fontSize: "0.8rem",
                border: "1px solid #1976d2",

                flexGrow: isSmallScreen ? 1 : "unset",
                minWidth: isSmallScreen ? "80px" : "auto",
              }}
            >
              {control.name}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      <Box sx={{ textAlign: "center", mb: 2, mt: 0 }}>
        <Typography
          variant={isSmallScreen ? "subtitle1" : "h6"}
          sx={{
            fontWeight: "bold",
            fontFamily: "poppins",
          }}
        >
          {dateRange}
        </Typography>
      </Box>

      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: 2,
          overflowX: "auto",
          maxHeight: isSmallScreen ? "60vh" : "80vh",
        }}
        ref={containerRef}
      />
    </Box>
  );
};

export default Dashboard;

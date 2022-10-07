import React, { useState, useEffect, useCallback } from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import getYear from "date-fns/getYear";

import styles from "./heatmap.module.css";

import {
  DEFAULT_THEME,
  LINE_HEIGHT,
  MIN_DISTANCE_MONTH_LABELS,
} from "./constants";
import { usePrevious } from "../../lib/hooks/use-previous";
import { getGraphData, locales } from "./contributions";
import { createCalendarTheme, getClassName } from "./utils";
import { Box, Text } from "grommet";
import Tip from "../tip";

export const Heatmap = ({
  blockSize = 12,
  blockMargin = 2,
  children,
  color = undefined,
  dateFormat = "d MMMM, yyyy",
  fontSize = 14,
  fullYear = false,
  theme = undefined,
  data,
  i18n = {
    loading: "Carregando...",
    lastYear: "Último ano",
    soFar: "até agora ",
    error: "Algo deu errado...",
    contributions: { plural: "sonhos", singular: "sonho" },
    on: "em",
    locale: "ptBR",
  },
  years = [Number(format(new Date(), "yyyy"))],
}) => {
  const [graphs, setGraphs] = useState(null);
  const [error, setError] = useState(null);

  const prevYears = usePrevious(years);
  const prevFullYear = usePrevious(fullYear);

  const fetchData = useCallback(() => {
    setError(null);
    setGraphs(
      getGraphData({
        data,
        years,
        fullYear,
        locale: i18n.locale,
      })
    );
  }, [years, data, fullYear]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line

  // Refetch if relevant props change
  useEffect(() => {
    if (
      prevFullYear !== fullYear ||
      prevYears.some((y) => !years.includes(y))
    ) {
      fetchData();
    }
  }, [fetchData, fullYear, prevFullYear, prevYears, years]);

  function getTheme() {
    if (theme) {
      return Object.assign({}, DEFAULT_THEME, theme);
    }

    if (color) {
      return createCalendarTheme(color);
    }

    return DEFAULT_THEME;
  }

  function getDimensions() {
    const textHeight = Math.round(fontSize * LINE_HEIGHT);

    // Since weeks start on Sunday, there is a good chance that the graph starts
    // in the week before January 1st. Therefore, the calendar shows 53 weeks.
    const width = (52 + 1) * (blockSize + blockMargin) - blockMargin;
    const height = textHeight + (blockSize + blockMargin) * 7 - blockMargin;

    return { width, height };
  }

  function getTooltipMessage(day) {
    const date = parseISO(day.date);
    return `${day.info.count} ${
      day.info.count === 1
        ? i18n.contributions.singular
        : i18n.contributions.singular
    } ${i18n.on} ${format(date, dateFormat, {
      locale: locales[i18n.locale],
    })}`;
  }

  function renderMonthLabels(monthLabels) {
    const style = {
      fill: getTheme().text,
      fontSize,
    };

    // Remove the first month label if there's not enough space to the next one
    // (end of previous month)
    if (monthLabels[1].x - monthLabels[0].x <= MIN_DISTANCE_MONTH_LABELS) {
      monthLabels.shift();
    }

    return monthLabels.map((month) => (
      <text
        x={(blockSize + blockMargin) * month.x}
        y={fontSize}
        key={month.x}
        style={style}
      >
        {month.label}
      </text>
    ));
  }

  function renderBlocks(blocks) {
    const theme = getTheme();
    const textHeight = Math.round(fontSize * LINE_HEIGHT);

    return blocks
      .map((week) =>
        week.map((day, y) => {
          if (!day.info) {
            return (
              <rect
                x="0"
                y={textHeight + (blockSize + blockMargin) * y}
                width={blockSize}
                height={blockSize}
                fill={theme[`grade${day.info ? day.info.intensity : 0}`]}
                key={day.date}
              />
            );
          }

          return (
            <Tip content={getTooltipMessage(day)}>
              <rect
                x="0"
                y={textHeight + (blockSize + blockMargin) * y}
                width={blockSize}
                height={blockSize}
                fill={theme[`grade${day.info ? day.info.intensity : 0}`]}
                key={day.date}
              />
            </Tip>
          );
        })
      )
      .map((week, x) => (
        <g key={x} transform={`translate(${(blockSize + blockMargin) * x}, 0)`}>
          {week}
        </g>
      ));
  }

  function renderMeta(year, totalCount) {
    const isCurrentYear = getYear(new Date()) === year;

    return (
      <Text>
        {isCurrentYear && fullYear ? i18n.lastYear : year}
        {" – "}
        {isCurrentYear && !fullYear ? i18n.soFar : null}
        {totalCount}{" "}
        {totalCount === 1
          ? i18n.contributions.singular
          : i18n.contributions.plural}
      </Text>
    );
  }

  const { width, height } = getDimensions();

  if (error) {
    console.error(error);
    return <Text>{i18n.error}</Text>;
  }

  if (!graphs) {
    return <Text>{i18n.loading}</Text>;
  }

  return (
    <Box
      style={{
        overflowX: "auto",
      }}
      pad="medium"
    >
      {graphs.map((graph) => {
        const { year, blocks, monthLabels, totalCount } = graph;

        return (
          <Box key={year}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className={getClassName("calendar", styles.calendar)}
              style={{ backgroundColor: theme?.background }}
            >
              {renderMonthLabels(monthLabels)}
              {renderBlocks(blocks)}
            </svg>

            {renderMeta(year, totalCount)}
            {children}
          </Box>
        );
      })}
    </Box>
  );
};

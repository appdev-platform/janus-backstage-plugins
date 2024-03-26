import React, { useEffect, useState } from 'react';

import { Table, TableColumn } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { IconButton, Link } from '@material-ui/core';
import Launch from '@material-ui/icons/Launch';
import { DateTime } from 'luxon';

import {
  LaunchDetailsResponse,
  PageType,
  reportPortalApiRef,
} from '../../../api';

type LaunchDetails = {
  id: number;
  launchName: string;
  number: number;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  startTime: number;
};

export const LaunchesPageContent = (props: {
  host: string;
  project: string;
}) => {
  const { host, project } = props;
  const reportPortalApi = useApi(reportPortalApiRef);

  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<{
    launches: LaunchDetails[];
    page: PageType;
  }>({
    launches: [],
    page: {
      number: 1,
      size: 10,
      totalElements: 0,
      totalPages: 1,
    },
  });

  useEffect(() => {
    setLoading(true);
    reportPortalApi
      .getLaunchResults(project, host, {
        'page.size': 10,
        'page.page': 1,
        'page.sort': 'startTime,DESC',
      })
      .then(res => {
        responseHandler(res);
      });
  }, [host, project, reportPortalApi]);

  function handlePageChange(page: number, pageSize: number) {
    setLoading(true);
    reportPortalApi
      .getLaunchResults(project, host, {
        'page.size': pageSize,
        'page.page': page + 1,
        'page.sort': 'startTime,DESC',
      })
      .then(res => {
        responseHandler(res);
      });
  }

  function responseHandler(res: LaunchDetailsResponse) {
    const tempArr: LaunchDetails[] = [];
    res.content.forEach(data => {
      tempArr.push({
        id: data.id,
        launchName: data.name,
        number: data.number,
        total: data.statistics.executions.total ?? '-',
        passed: data.statistics.executions.passed ?? '-',
        failed: data.statistics.executions.failed ?? '-',
        skipped: data.statistics.executions.skipped ?? '-',
        startTime: data.startTime,
      });
    });
    setTableData({ launches: tempArr, page: res.page });
    setLoading(false);
  }

  const columns: TableColumn<LaunchDetails>[] = [
    {
      id: 0,
      field: 'launchName',
      title: 'Launch',
      render: row => (
        <Link
          rel="noopener noreferrer"
          target="_blank"
          href={`https://${host}/ui/#${project}/launches/latest/${row.id}`}
        >
          {row.launchName} #{row.number}
        </Link>
      ),
      width: '50%',
      searchable: true,
    },
    {
      id: 1,
      title: 'Total',
      align: 'center',
      width: '5%',
      render: row => <b>{row.total}</b>,
    },
    {
      id: 2,
      title: 'Passed',
      align: 'center',
      width: '5%',
      render: row => <b>{row.passed}</b>,
    },
    {
      id: 3,
      title: 'Failed',
      align: 'center',
      width: '5%',
      render: row => <b>{row.failed}</b>,
    },
    {
      id: 4,
      title: 'Skipped',
      align: 'center',
      width: '5%',
      render: row => <b>{row.skipped}</b>,
    },
    {
      id: 4,
      title: 'Start Time',
      align: 'center',
      width: '25%',
      render: row => DateTime.fromMillis(row.startTime).toRelative(),
    },
    {
      id: 5,
      title: 'Actions',
      align: 'left',
      width: '5%',
      render: row => (
        <IconButton
          target="_blank"
          rel="noopener noreferrer"
          href={`https://${host}/ui/#${project}/launches/latest/${row.id}`}
        >
          <Launch />
        </IconButton>
      ),
    },
  ];
  return (
    <Table
      title="Launches"
      options={{
        pageSizeOptions: [5, 10, 20],
        sorting: false,
        pageSize: tableData.page.size,
        searchFieldVariant: 'outlined',
        padding: 'dense',
        paginationPosition: 'both',
      }}
      columns={columns}
      data={tableData?.launches ?? []}
      page={tableData?.page.number - 1}
      totalCount={tableData?.page.totalElements}
      onPageChange={handlePageChange}
      isLoading={loading}
    />
  );
};

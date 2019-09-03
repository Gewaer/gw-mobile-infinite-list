import { AxiosInstance } from "axios";

export interface Props {
  emptyListMessage: string;
  endpoint: string;
  getItemsWhenMounted: boolean;
  initialNumToRender: number;
  itemKey: string;
  itemsPerPage: number;
  maxToRenderPerBatch: number;
  onRefreshAction: () => void;
  onEndReachedThreshold: number;
  queryString: string;
  renderListHeader: () => JSX.Element;
  renderListItem: () => JSX.Element;
  sortingKey: string;
  sortingMode: string;
  stickyHeader: boolean;
  windowSize: number;
  spinnerColor: string;
  axiosInstance: AxiosInstance;
}

export interface State {
  isLoading: boolean;
  items: any[];
  itemsLimitReached: boolean;
  page: number;
  refreshingList: boolean;
}

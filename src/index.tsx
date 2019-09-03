import React, { Component } from "react";
import { View, FlatList } from "react-native";
import Stylesheet from "./stylesheet";
import { Text, Spinner } from "native-base";
import { Props, State } from "./types";
import axios, { AxiosResponse, AxiosError } from "axios";

class InfiniteList extends Component<Props, State> {
  static defaultProps = {
    emptyListMessage: "There are no available items at this time.",
    endpoint: "",
    getItemsWhenMounted: true,
    initialNumToRender: 2,
    itemKey: "id",
    itemsPerPage: 5,
    maxToRenderPerBatch: 4,
    onEndReachedThreshold: 1,
    onRefreshAction: () => null,
    queryString: "",
    renderListHeader: () => <View />,
    renderListItem: () => <View />,
    sortingKey: "",
    sortingMode: "desc",
    stickyHeader: false,
    windowSize: 20,
    spinnerColor: "black",
    axiosInstance: axios
  };

  state = {
    isLoading: true,
    items: [],
    itemsLimitReached: false,
    page: 1,
    refreshingList: false
  };

  componentDidMount() {
    if (this.props.getItemsWhenMounted) {
      this.getItems();
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.sortingMode !== this.props.sortingMode) {
      this.setState(
        { page: 1, items: [], itemsLimitReached: false, isLoading: true },
        () => this.getItems()
      );
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (nextState.items !== this.state.items) {
      return true;
    }
    if (nextProps.sortingMode !== this.props.sortingMode) {
      return true;
    }

    return false;
  }

  appendItemToList = (newItem: any) => {
    let updatedItems = [...this.state.items];
    if (this.props.sortingMode === "desc") {
      updatedItems = [newItem, ...updatedItems];
    } else if (this.props.sortingMode === "asc") {
      updatedItems = updatedItems.concat(newItem);
    }
    this.setState({ items: updatedItems });
  };

  applyListFilters = () => {
    this.setState(
      {
        page: 1,
        items: [],
        itemsLimitReached: false,
        isLoading: true
      },
      () => {
        this.getItems();
      }
    );
  };

  getFilters() {
    return this.props.queryString ? `&q=(${this.props.queryString})` : "";
  }

  getSortingFilters() {
    return this.props.sortingKey
      ? `&sort=${this.props.sortingKey}|${this.props.sortingMode}`
      : "";
  }

  getItems = () => {
    this.props.axiosInstance
      .get(
        this.props.endpoint +
          `?format=true&limit=${this.props.itemsPerPage}&page=${this.state.page}` +
          `${this.getFilters()}` +
          `${this.getSortingFilters()}`
      )
      .then((response: AxiosResponse) => {
        if (response.data.data) {
          this.setState({
            items: this.state.refreshingList
              ? response.data.data
              : [...this.state.items, ...response.data.data],
            isLoading: false,
            refreshingList: false,
            itemsLimitReached:
              this.state.page === Number(response.data.total_pages) ||
              Number(response.data.total_pages) === 0
          });
        } else {
          this.setState({
            items: this.state.refreshingList
              ? []
              : [...this.state.items, ...[]],
            isLoading: false,
            refreshingList: false,
            itemsLimitReached: true
          });
        }
      })
      .catch((error: AxiosError) => {
        console.log(error.response);
      });
  };

  handleLoadMoreData = () => {
    if (this.state.itemsLimitReached) {
      this.setState({ isLoading: false });
      return;
    } else if (this.state.isLoading) {
      return;
    }

    this.setState(
      {
        page: this.state.page + 1,
        isLoading: true
      },
      () => this.getItems()
    );
  };

  handleListRefresh = () => {
    this.setState(
      {
        page: 1,
        refreshingList: true
      },
      () => {
        this.getItems();
        this.props.onRefreshAction();
      }
    );
  };

  keyExtractor = (item: any) => String(item[this.props.itemKey]);

  renderListFooter = () => {
    if (this.state.itemsLimitReached && this.state.items.length !== 0) {
      return null;
    } else if (this.state.itemsLimitReached && this.state.items.length === 0) {
      return (
        <View style={Stylesheet.footerText}>
          <Text>{this.props.emptyListMessage}</Text>
        </View>
      );
    }

    return (
      <View style={Stylesheet.loadingSpinner}>
        <Spinner color={this.props.spinnerColor} />
      </View>
    );
  };

  render() {
    return (
      <FlatList
        data={this.state.items}
        extraData={this.state}
        keyExtractor={this.keyExtractor}
        renderItem={this.props.renderListItem}
        onEndReachedThreshold={this.props.onEndReachedThreshold}
        ListHeaderComponent={this.props.renderListHeader}
        ListFooterComponent={this.renderListFooter}
        onEndReached={this.handleLoadMoreData}
        initialNumToRender={this.props.initialNumToRender}
        maxToRenderPerBatch={this.props.maxToRenderPerBatch}
        windowSize={this.props.windowSize}
        refreshing={this.state.refreshingList}
        onRefresh={this.handleListRefresh}
        stickyHeaderIndices={this.props.stickyHeader ? [0] : []}
      />
    );
  }
}

export default InfiniteList;

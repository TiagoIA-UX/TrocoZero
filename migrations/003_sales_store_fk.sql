ALTER TABLE sales
  ADD CONSTRAINT sales_store_fk
  FOREIGN KEY (store_id) REFERENCES stores(id);

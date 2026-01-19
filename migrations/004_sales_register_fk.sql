ALTER TABLE sales
  ADD CONSTRAINT sales_register_fk
  FOREIGN KEY (register_id) REFERENCES cash_registers(id);

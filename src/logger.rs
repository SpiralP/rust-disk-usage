// use clap::crate_name;
use env_logger;
use log;
use std::sync::Once;

#[inline]
pub fn initialize_logger(debug: bool) {
  static START: Once = Once::new();

  START.call_once(|| {
    let level = if debug {
      log::LevelFilter::Debug
    } else {
      log::LevelFilter::Info
    };

    env_logger::Builder::from_default_env()
      .default_format_timestamp(false)
      .default_format_module_path(false)
      .filter(None, level)
      .init();
  });
}
